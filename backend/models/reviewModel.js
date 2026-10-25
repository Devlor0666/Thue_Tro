const db = require("../config/db");
const listByRoom = async (roomId) => {
  const [rows] = await db.execute(
    `SELECT d.id, d.soSao, d.binhLuan, d.ngayTao, d.nguoiDungId, u.hoTen
     FROM DanhGia d JOIN NguoiDung u ON u.id = d.nguoiDungId WHERE d.phongId = ? ORDER BY d.ngayTao DESC`, [roomId]);
  return rows;
};
const hasRented = async (userId, roomId) => {
  const [rows] = await db.execute("SELECT id FROM HopDong WHERE nguoiThueId = ? AND phongId = ? AND trangThai IN ('hieu_luc', 'het_han') LIMIT 1", [userId, roomId]);
  return Boolean(rows[0]);
};
const save = async (userId, roomId, soSao, binhLuan) => {
  const [existing] = await db.execute("SELECT id FROM DanhGia WHERE nguoiDungId = ? AND phongId = ? LIMIT 1", [userId, roomId]);
  if (existing[0]) {
    await db.execute("UPDATE DanhGia SET soSao = ?, binhLuan = ?, ngayTao = CURRENT_TIMESTAMP WHERE id = ?", [soSao, binhLuan || null, existing[0].id]);
    return existing[0].id;
  }
  const [result] = await db.execute("INSERT INTO DanhGia (soSao, binhLuan, nguoiDungId, phongId) VALUES (?, ?, ?, ?)", [soSao, binhLuan || null, userId, roomId]);
  return result.insertId;
};
module.exports = { listByRoom, hasRented, save };
