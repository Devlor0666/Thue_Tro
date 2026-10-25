const db = require("../config/db");

const listByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT y.id AS yeuThichId, y.ngayTao AS ngayYeuThich, l.id AS tinDangId, l.tieuDe,
            p.id AS phongId, p.diaChi, p.diaChiTinh, p.diaChiXa, p.giaThue, p.dienTich,
            (SELECT a.duongDan FROM AnhPhong a WHERE a.phongId = p.id ORDER BY a.id LIMIT 1) AS anhDaiDien
     FROM YeuThich y JOIN TinDang l ON l.id = y.tinDangId JOIN Phong p ON p.id = l.phongId
     WHERE y.nguoiDungId = ? AND l.trangThai = 'da_dang' AND p.trangThai = 'trong'
     ORDER BY y.ngayTao DESC`, [userId]);
  return rows;
};

const add = async (userId, listingId) => {
  const [result] = await db.execute("INSERT INTO YeuThich (tinDangId, nguoiDungId) VALUES (?, ?)", [listingId, userId]);
  return result.insertId;
};

const remove = async (userId, listingId) => {
  const [result] = await db.execute("DELETE FROM YeuThich WHERE nguoiDungId = ? AND tinDangId = ?", [userId, listingId]);
  return result.affectedRows > 0;
};

const listingIsPublic = async (listingId) => {
  const [rows] = await db.execute("SELECT l.id FROM TinDang l JOIN Phong p ON p.id = l.phongId WHERE l.id = ? AND l.trangThai = 'da_dang' AND p.trangThai = 'trong'", [listingId]);
  return Boolean(rows[0]);
};

module.exports = { listByUser, add, remove, listingIsPublic };
