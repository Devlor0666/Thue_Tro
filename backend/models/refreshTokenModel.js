const db = require("../config/db");

const getRefreshTokenByUserId = async (nguoiDungId) => {
  const [rows] = await db.execute(
    "SELECT id, nguoiDungId, token, ngayHetHan, daThuHoi FROM RefreshToken WHERE nguoiDungId = ? AND daThuHoi = FALSE ORDER BY id DESC LIMIT 1",
    [nguoiDungId],
  );
  return rows[0] || null;
};

const saveRefreshToken = async (nguoiDungId, token, ngayHetHan) => {
  await db.execute(
    "INSERT INTO RefreshToken (nguoiDungId, token, ngayHetHan) VALUES (?, ?, ?)",
    [nguoiDungId, token, ngayHetHan],
  );
};

const deleteRefreshTokenById = async (nguoiDungId) => {
  await db.execute("DELETE FROM RefreshToken WHERE nguoiDungId = ?", [nguoiDungId]);
};

const deleteRefreshTokenByToken = async (token) => {
  await db.execute("DELETE FROM RefreshToken WHERE token = ?", [token]);
};

module.exports = { getRefreshTokenByUserId, saveRefreshToken, deleteRefreshTokenById, deleteRefreshTokenByToken };
