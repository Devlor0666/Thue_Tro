const db = require("../config/db");
const AppError = require("../utils/AppError");

const listByUser = async (userId, isAdmin) => {
  const clause = isAdmin ? "1 = 1" : "(h.nguoiThueId = ? OR p.chuTroId = ?)";
  const values = isAdmin ? [] : [userId, userId];
  const [rows] = await db.execute(
    `SELECT h.id, h.phongId, h.nguoiThueId, h.ngayBatDau, h.ngayKetThuc, h.giaThue, h.tienCoc, h.trangThai,
            p.diaChi, p.diaChiTinh, p.diaChiXa, p.chuTroId, owner.hoTen AS tenChuTro, tenant.hoTen AS tenNguoiThue,
            tenant.soDienThoai AS dienThoaiNguoiThue
     FROM HopDong h JOIN Phong p ON p.id = h.phongId JOIN NguoiDung owner ON owner.id = p.chuTroId
     JOIN NguoiDung tenant ON tenant.id = h.nguoiThueId WHERE ${clause} ORDER BY h.id DESC`, values);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT h.*, p.chuTroId, p.trangThai AS trangThaiPhong, p.diaChi, owner.hoTen AS tenChuTro,
            tenant.hoTen AS tenNguoiThue
     FROM HopDong h JOIN Phong p ON p.id = h.phongId JOIN NguoiDung owner ON owner.id = p.chuTroId
     JOIN NguoiDung tenant ON tenant.id = h.nguoiThueId WHERE h.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const create = async (tenantId, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rooms] = await connection.execute(
      `SELECT p.id, p.chuTroId, p.giaThue, p.trangThai,
              (SELECT l.trangThai FROM TinDang l WHERE l.phongId = p.id ORDER BY l.id DESC LIMIT 1) AS trangThaiTinDang
       FROM Phong p WHERE p.id = ? FOR UPDATE`, [data.phongId]);
    const room = rooms[0];
    if (!room) throw new AppError("Không tìm thấy phòng", 404);
    if (Number(room.chuTroId) === Number(tenantId)) throw new AppError("Bạn không thể thuê phòng do chính mình đăng", 400);
    if (room.trangThai !== "trong" || room.trangThaiTinDang !== "da_dang") throw new AppError("Phòng không còn khả dụng để yêu cầu thuê", 409);
    if (new Date(data.ngayKetThuc) < new Date(data.ngayBatDau)) throw new AppError("Ngày kết thúc phải sau ngày bắt đầu", 400);
    const [existing] = await connection.execute("SELECT id FROM HopDong WHERE phongId = ? AND nguoiThueId = ? AND trangThai IN ('cho_hieu_luc', 'hieu_luc') LIMIT 1", [data.phongId, tenantId]);
    if (existing[0]) throw new AppError("Bạn đã có yêu cầu hoặc hợp đồng đang hoạt động cho phòng này", 409);
    const [result] = await connection.execute(
      `INSERT INTO HopDong (phongId, nguoiThueId, ngayBatDau, ngayKetThuc, giaThue, tienCoc, trangThai)
       VALUES (?, ?, ?, ?, ?, ?, 'cho_hieu_luc')`,
      [data.phongId, tenantId, data.ngayBatDau, data.ngayKetThuc, room.giaThue, data.tienCoc]);
    await connection.commit();
    return result.insertId;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
};

const updateStatus = async (id, nextStatus) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [contracts] = await connection.execute("SELECT id, phongId, trangThai FROM HopDong WHERE id = ? FOR UPDATE", [id]);
    const contract = contracts[0];
    if (!contract) throw new AppError("Không tìm thấy hợp đồng", 404);
    if (nextStatus === "hieu_luc") {
      const [rooms] = await connection.execute("SELECT trangThai FROM Phong WHERE id = ? FOR UPDATE", [contract.phongId]);
      if (rooms[0]?.trangThai !== "trong") throw new AppError("Phòng không còn trống nên không thể kích hoạt hợp đồng", 409);
      const [active] = await connection.execute("SELECT id FROM HopDong WHERE phongId = ? AND trangThai = 'hieu_luc' AND id <> ? LIMIT 1", [contract.phongId, id]);
      if (active[0]) throw new AppError("Phòng đã có hợp đồng đang có hiệu lực", 409);
      await connection.execute("UPDATE HopDong SET trangThai = 'hieu_luc' WHERE id = ?", [id]);
      await connection.execute("UPDATE Phong SET trangThai = 'da_thue' WHERE id = ?", [contract.phongId]);
      await connection.execute("UPDATE TinDang SET trangThai = 'da_an' WHERE phongId = ? AND trangThai = 'da_dang'", [contract.phongId]);
    } else {
      await connection.execute("UPDATE HopDong SET trangThai = ? WHERE id = ?", [nextStatus, id]);
      if (["da_huy", "het_han"].includes(nextStatus) && contract.trangThai === "hieu_luc") {
        const [active] = await connection.execute("SELECT id FROM HopDong WHERE phongId = ? AND trangThai = 'hieu_luc' AND id <> ? LIMIT 1", [contract.phongId, id]);
        if (!active[0]) await connection.execute("UPDATE Phong SET trangThai = 'trong' WHERE id = ?", [contract.phongId]);
      }
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
};
module.exports = { listByUser, getById, create, updateStatus };
