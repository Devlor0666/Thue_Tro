const db = require("../config/db");
const create = async (userId, listingId, lyDo) => {
  const [result] = await db.execute("INSERT INTO BaoCao (tinDangId, nguoiDungId, lyDo) VALUES (?, ?, ?)", [listingId, userId, lyDo]);
  return result.insertId;
};
const list = async () => {
  const [rows] = await db.execute(
    `SELECT b.id, b.tinDangId, b.nguoiDungId, b.lyDo, b.trangThai, b.ngayTao,
            u.hoTen AS tenNguoiBaoCao, u.email, l.tieuDe
     FROM BaoCao b JOIN NguoiDung u ON u.id = b.nguoiDungId JOIN TinDang l ON l.id = b.tinDangId
     ORDER BY CASE b.trangThai WHEN 'cho_xu_ly' THEN 0 ELSE 1 END, b.ngayTao DESC`);
  return rows;
};
const updateStatus = async (id, trangThai) => {
  const [result] = await db.execute("UPDATE BaoCao SET trangThai = ? WHERE id = ?", [trangThai, id]);
  return result.affectedRows > 0;
};
module.exports = { create, list, updateStatus };
