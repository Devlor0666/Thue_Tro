const db = require("../config/db");
const getRoom = async (roomId) => {
  const [rows] = await db.execute("SELECT id, chuTroId, trangThai FROM Phong WHERE id = ? LIMIT 1", [roomId]);
  return rows[0] || null;
};
const listByRoom = async (roomId, userId, peerId) => {
  const [rows] = await db.execute(
    `SELECT m.id, m.phongId, m.nguoiGuiId, m.nguoiNhanId, m.noiDung, m.ngayGui, m.daDoc,
            g.hoTen AS tenNguoiGui, n.hoTen AS tenNguoiNhan
     FROM TinNhan m JOIN NguoiDung g ON g.id = m.nguoiGuiId JOIN NguoiDung n ON n.id = m.nguoiNhanId
     WHERE m.phongId = ?
       AND ((m.nguoiGuiId = ? AND m.nguoiNhanId = ?) OR (m.nguoiGuiId = ? AND m.nguoiNhanId = ?))
     ORDER BY m.ngayGui ASC, m.id ASC`, [roomId, userId, peerId, peerId, userId]);
  return rows;
};

const listInbox = async (userId) => {
  const [rows] = await db.execute(
    `SELECT c.phongId, c.doiTacId, p.chuTroId, p.diaChi,
            (SELECT l.tieuDe FROM TinDang l WHERE l.phongId = p.id ORDER BY l.id DESC LIMIT 1) AS tieuDe,
            doiTac.hoTen AS tenDoiTac,
            (SELECT m2.noiDung FROM TinNhan m2
             WHERE m2.phongId = c.phongId
               AND ((m2.nguoiGuiId = ? AND m2.nguoiNhanId = c.doiTacId)
                 OR (m2.nguoiGuiId = c.doiTacId AND m2.nguoiNhanId = ?))
             ORDER BY m2.ngayGui DESC, m2.id DESC LIMIT 1) AS tinNhanCuoi,
            (SELECT m2.ngayGui FROM TinNhan m2
             WHERE m2.phongId = c.phongId
               AND ((m2.nguoiGuiId = ? AND m2.nguoiNhanId = c.doiTacId)
                 OR (m2.nguoiGuiId = c.doiTacId AND m2.nguoiNhanId = ?))
             ORDER BY m2.ngayGui DESC, m2.id DESC LIMIT 1) AS ngayCapNhat,
            (SELECT COUNT(*) FROM TinNhan m2
             WHERE m2.phongId = c.phongId AND m2.nguoiGuiId = c.doiTacId
               AND m2.nguoiNhanId = ? AND m2.daDoc = FALSE) AS soTinChuaDoc
     FROM (
       SELECT DISTINCT phongId,
              CASE WHEN nguoiGuiId = ? THEN nguoiNhanId ELSE nguoiGuiId END AS doiTacId
       FROM TinNhan WHERE nguoiGuiId = ? OR nguoiNhanId = ?
     ) c
     JOIN Phong p ON p.id = c.phongId
     JOIN NguoiDung doiTac ON doiTac.id = c.doiTacId
     ORDER BY ngayCapNhat DESC`,
    [userId, userId, userId, userId, userId, userId, userId, userId],
  );
  return rows;
};

const isParticipant = async (roomId, userId) => {
  const [rows] = await db.execute("SELECT id FROM TinNhan WHERE phongId = ? AND (nguoiGuiId = ? OR nguoiNhanId = ?) LIMIT 1", [roomId, userId, userId]);
  return Boolean(rows[0]);
};
const send = async (roomId, senderId, recipientId, noiDung) => {
  const [result] = await db.execute("INSERT INTO TinNhan (phongId, nguoiNhanId, nguoiGuiId, noiDung) VALUES (?, ?, ?, ?)", [roomId, recipientId, senderId, noiDung]);
  return result.insertId;
};
const markRead = async (roomId, userId, peerId) => {
  await db.execute(
    "UPDATE TinNhan SET daDoc = TRUE WHERE phongId = ? AND nguoiNhanId = ? AND nguoiGuiId = ?",
    [roomId, userId, peerId],
  );
};
module.exports = { getRoom, listByRoom, listInbox, isParticipant, send, markRead };
