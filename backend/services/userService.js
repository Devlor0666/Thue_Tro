const bcrypt = require("bcrypt");
const userModels = require("../models/userModel");
const AppError = require("../utils/AppError");

const login = async (email, matKhau) => {
  const user = await userModels.getUserByEmail(email);
  // Tránh phân biệt email không tồn tại và mật khẩu sai ở thông báo đăng nhập.
  if (!user || !(await bcrypt.compare(matKhau, user.matKhau))) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }
  if (user.trangThai !== "hoat_dong") throw new AppError("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên", 403);
  return user;
};

const createUser = async (data) => {
  const matKhau = await bcrypt.hash(data.matKhau, 10);
  return userModels.createUser({ ...data, matKhau });
};

const updatePassword = async (id, matKhauCu, matKhauMoi) => {
  const user = await userModels.getUserAuthById(id);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);
  if (!(await bcrypt.compare(matKhauCu, user.matKhau))) throw new AppError("Mật khẩu hiện tại không đúng", 401);
  if (matKhauCu === matKhauMoi) throw new AppError("Mật khẩu mới phải khác mật khẩu hiện tại", 400);
  await userModels.updatePassword(id, await bcrypt.hash(matKhauMoi, 10));
};

const updatePasswordUser = async (id, matKhau) => {
  const user = await userModels.getUserById(id);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);
  await userModels.updatePassword(id, await bcrypt.hash(matKhau, 10));
};

const getProfile = async (id) => {
  const user = await userModels.getUserById(id);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);
  return user;
};

const deleteUser = async (id) => {
  const existed = await userModels.getUserById(id);
  if (!existed) throw new AppError("Không tìm thấy người dùng", 404);
  await userModels.deleteUser(id);
};

module.exports = { login, createUser, updatePassword, updatePasswordUser, getProfile, deleteUser };
