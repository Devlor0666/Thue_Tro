const db = require("../config/db");
const AppError = require("../utils/AppError");

const listByUser = async (userId, isAdmin) => {
  const where = isAdmin ? "1 = 1" : "(h.nguoiThueId = ? OR p.chuTroId = ?)";
  const values = isAdmin ? [] : [userId, userId];
  const [rows] = await db.execute(
    `SELECT hd.id, hd.hopDongId, hd.thang, hd.nam, hd.tienPhong, hd.tienDien, hd.tienNuoc, hd.khoanKhac,
            hd.tongTien, hd.hanThanhToan, hd.trangThai, h.nguoiThueId, p.chuTroId,
            p.diaChi, tenant.hoTen AS tenNguoiThue, owner.hoTen AS tenChuTro
     FROM HoaDon hd JOIN HopDong h ON h.id = hd.hopDongId JOIN Phong p ON p.id = h.phongId
     JOIN NguoiDung tenant ON tenant.id = h.nguoiThueId JOIN NguoiDung owner ON owner.id = p.chuTroId
     WHERE ${where} ORDER BY hd.nam DESC, hd.thang DESC`, values);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT hd.*, h.nguoiThueId, h.phongId, h.trangThai AS trangThaiHopDong,
            p.chuTroId, p.diaChi, owner.hoTen AS tenChuTro, tenant.hoTen AS tenNguoiThue
     FROM HoaDon hd JOIN HopDong h ON h.id = hd.hopDongId JOIN Phong p ON p.id = h.phongId
     JOIN NguoiDung owner ON owner.id = p.chuTroId JOIN NguoiDung tenant ON tenant.id = h.nguoiThueId
     WHERE hd.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const create = async (ownerId, isAdmin, data) => {
  const [contracts] = await db.execute(
    `SELECT h.id, h.nguoiThueId, h.giaThue, h.trangThai, p.chuTroId
     FROM HopDong h JOIN Phong p ON p.id = h.phongId WHERE h.id = ? LIMIT 1`, [data.hopDongId]);
  const contract = contracts[0];
  if (!contract) throw new AppError("Không tìm thấy hợp đồng", 404);
  if (!isAdmin && Number(contract.chuTroId) !== Number(ownerId)) throw new AppError("Bạn không có quyền tạo hóa đơn cho hợp đồng này", 403);
  if (contract.trangThai !== "hieu_luc") throw new AppError("Chỉ tạo hóa đơn cho hợp đồng đang có hiệu lực", 409);
  const tienPhong = Number(data.tienPhong ?? contract.giaThue);
  const tienDien = Number(data.tienDien || 0);
  const tienNuoc = Number(data.tienNuoc || 0);
  const khoanKhac = Number(data.khoanKhac || 0);
  const tongTien = tienPhong + tienDien + tienNuoc + khoanKhac;
  if (![tienPhong, tienDien, tienNuoc, khoanKhac].every((value) => Number.isFinite(value) && value >= 0)) throw new AppError("Các khoản tiền phải là số không âm", 400);
  const [result] = await db.execute(
    `INSERT INTO HoaDon (hopDongId, thang, nam, tienPhong, tienDien, tienNuoc, khoanKhac, tongTien, hanThanhToan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.hopDongId, data.thang, data.nam, tienPhong, tienDien, tienNuoc, khoanKhac, tongTien, data.hanThanhToan]);
  return { id: result.insertId, tongTien };
};

const updateStatus = async (id, trangThai) => {
  const [result] = await db.execute("UPDATE HoaDon SET trangThai = ? WHERE id = ?", [trangThai, id]);
  return result.affectedRows > 0;
};
module.exports = { listByUser, getById, create, updateStatus };
