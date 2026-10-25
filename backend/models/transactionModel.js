const db = require("../config/db");
const AppError = require("../utils/AppError");

const getInvoiceContext = async (invoiceId) => {
  const [rows] = await db.execute(
    `SELECT hd.id AS hoaDonId, hd.tongTien, hd.trangThai AS trangThaiHoaDon,
            h.id AS hopDongId, h.nguoiThueId, h.phongId, p.chuTroId
     FROM HoaDon hd JOIN HopDong h ON h.id = hd.hopDongId JOIN Phong p ON p.id = h.phongId
     WHERE hd.id = ? LIMIT 1`, [invoiceId]);
  return rows[0] || null;
};

const create = async (invoiceId, senderId, phuongThuc, soTien) => {
  const invoice = await getInvoiceContext(invoiceId);
  if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);
  if (Number(invoice.nguoiThueId) !== Number(senderId)) throw new AppError("Chỉ người thuê trên hợp đồng mới được gửi giao dịch", 403);
  if (invoice.trangThaiHoaDon === "da_thanh_toan") throw new AppError("Hóa đơn đã được thanh toán", 409);
  if (Number(soTien) !== Number(invoice.tongTien)) throw new AppError("Số tiền giao dịch phải bằng tổng hóa đơn", 400);
  const [pending] = await db.execute("SELECT id FROM GiaoDich WHERE hoaDonId = ? AND trangThai = 'cho_xu_ly' LIMIT 1", [invoiceId]);
  if (pending[0]) throw new AppError("Hóa đơn đã có giao dịch đang chờ xử lý", 409);
  const [result] = await db.execute(
    "INSERT INTO GiaoDich (nguoiNhanId, hoaDonId, nguoiGuiId, soTien, phuongThuc) VALUES (?, ?, ?, ?, ?)",
    [invoice.chuTroId, invoiceId, senderId, soTien, phuongThuc]);
  return result.insertId;
};

const listByUser = async (userId, isAdmin) => {
  const where = isAdmin ? "1 = 1" : "(gd.nguoiGuiId = ? OR gd.nguoiNhanId = ?)";
  const values = isAdmin ? [] : [userId, userId];
  const [rows] = await db.execute(
    `SELECT gd.id, gd.nguoiNhanId, gd.hoaDonId, gd.nguoiGuiId, gd.soTien, gd.phuongThuc, gd.trangThai, gd.ngayGiaoDich,
            hd.thang, hd.nam, hd.tongTien, sender.hoTen AS tenNguoiGui, receiver.hoTen AS tenNguoiNhan
     FROM GiaoDich gd JOIN HoaDon hd ON hd.id = gd.hoaDonId
     JOIN NguoiDung sender ON sender.id = gd.nguoiGuiId JOIN NguoiDung receiver ON receiver.id = gd.nguoiNhanId
     WHERE ${where} ORDER BY gd.ngayGiaoDich DESC`, values);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT gd.*, h.nguoiThueId, p.chuTroId FROM GiaoDich gd JOIN HoaDon hd ON hd.id = gd.hoaDonId
     JOIN HopDong h ON h.id = hd.hopDongId JOIN Phong p ON p.id = h.phongId WHERE gd.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const updateStatus = async (id, trangThai) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT hoaDonId, trangThai FROM GiaoDich WHERE id = ? FOR UPDATE", [id]);
    if (!rows[0]) throw new AppError("Không tìm thấy giao dịch", 404);
    await connection.execute("UPDATE GiaoDich SET trangThai = ? WHERE id = ?", [trangThai, id]);
    if (trangThai === "thanh_cong") await connection.execute("UPDATE HoaDon SET trangThai = 'da_thanh_toan' WHERE id = ?", [rows[0].hoaDonId]);
    if (trangThai === "hoan_tien") await connection.execute("UPDATE HoaDon SET trangThai = 'chua_thanh_toan' WHERE id = ?", [rows[0].hoaDonId]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
};
module.exports = { getInvoiceContext, create, listByUser, getById, updateStatus };
