const db = require("../config/db");

const getUsers = async () => {
  const [rows] = await db.execute(
    "SELECT id, hoTen, email, soDienThoai, vaiTro, trangThai, ngayTao FROM NguoiDung ORDER BY id DESC",
  );
  return rows;
};

const createUser = async ({ hoTen, email, matKhau, soDienThoai }) => {
  const [result] = await db.execute(
    "INSERT INTO NguoiDung (hoTen, email, matKhau, soDienThoai) VALUES (?, ?, ?, ?)",
    [hoTen, email, matKhau, soDienThoai],
  );
  return result.insertId;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT id, hoTen, email, matKhau, soDienThoai, vaiTro, trangThai FROM NguoiDung WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
};

const getUserById = async (id) => {
  const [rows] = await db.execute(
    "SELECT id, hoTen, email, soDienThoai, vaiTro, trangThai, ngayTao FROM NguoiDung WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
};

const getUserAuthById = async (id) => {
  const [rows] = await db.execute(
    "SELECT id, hoTen, email, matKhau, soDienThoai, vaiTro, trangThai FROM NguoiDung WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
};

const updateUser = async (data, id) => {
  const allowed = { hoTen: "hoTen", email: "email", soDienThoai: "soDienThoai" };
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }
  if (!fields.length) return;
  values.push(id);
  await db.execute(`UPDATE NguoiDung SET ${fields.join(", ")} WHERE id = ?`, values);
};

const updatePassword = async (id, passwordHash) => {
  await db.execute("UPDATE NguoiDung SET matKhau = ? WHERE id = ?", [passwordHash, id]);
};

const updateRole = async (id, vaiTro) => {
  const [result] = await db.execute("UPDATE NguoiDung SET vaiTro = ? WHERE id = ?", [vaiTro, id]);
  return result.affectedRows > 0;
};

const updateStatus = async (id, trangThai) => {
  const [result] = await db.execute("UPDATE NguoiDung SET trangThai = ? WHERE id = ?", [trangThai, id]);
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const [result] = await db.execute("DELETE FROM NguoiDung WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getUsers,
  createUser,
  getUserByEmail,
  getUserById,
  getUserAuthById,
  updateUser,
  updatePassword,
  updateRole,
  updateStatus,
  deleteUser,
};
