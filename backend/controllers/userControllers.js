const userModel = require("../models/userModel");
const jwtMethod = require("../utils/jwt");
const userService = require("../services/userService");
const refreshTokenModel = require("../models/refreshTokenModel");
const AppError = require("../utils/AppError");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const publicPayload = (user) => ({
  id: user.id,
  hoTen: user.hoTen,
  email: user.email,
  soDienThoai: user.soDienThoai,
  vaiTro: user.vaiTro,
});

const login = async (req, res) => {
  const user = await userService.login(req.body.email, req.body.matKhau);
  const payload = publicPayload(user);
  const accessToken = jwtMethod.createAccessToken(payload);
  const refreshToken = jwtMethod.createRefreshToken({ id: user.id });
  const ngayHetHan = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await refreshTokenModel.deleteRefreshTokenById(user.id);
  await refreshTokenModel.saveRefreshToken(user.id, refreshToken, ngayHetHan);
  res.cookie("refreshToken", refreshToken, cookieOptions());
  return res.status(200).json({ message: "Đăng nhập thành công", accessToken, user: payload });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) await refreshTokenModel.deleteRefreshTokenByToken(refreshToken);
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie("refreshToken", options);
  return res.status(200).json({ message: "Đăng xuất thành công" });
};

const createUser = async (req, res) => {
  const id = await userService.createUser(req.body);
  return res.status(201).json({ message: "Tạo tài khoản thành công", id });
};

const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return res.status(200).json({ user });
};

const updateProfile = async (req, res) => {
  await userModel.updateUser(req.body, req.user.id);
  const user = await userService.getProfile(req.user.id);
  return res.status(200).json({ message: "Cập nhật thông tin thành công", user });
};

const updatePassword = async (req, res) => {
  await userService.updatePassword(req.user.id, req.body.matKhauCu, req.body.matKhau);
  await refreshTokenModel.deleteRefreshTokenById(req.user.id);
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie("refreshToken", options);
  return res.status(200).json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại" });
};

const getUsers = async (req, res) => {
  const users = await userModel.getUsers();
  return res.status(200).json({ data: users });
};

const getUserById = async (req, res) => {
  const user = await userModel.getUserById(req.params.id);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);
  return res.status(200).json({ user });
};

const updateUser = async (req, res) => {
  const existed = await userModel.getUserById(req.params.id);
  if (!existed) throw new AppError("Không tìm thấy người dùng", 404);
  await userModel.updateUser(req.body, req.params.id);
  const user = await userModel.getUserById(req.params.id);
  return res.status(200).json({ message: "Cập nhật người dùng thành công", user });
};

const updateRole = async (req, res) => {
  const id = Number(req.params.id);
  if (id === Number(req.user.id)) throw new AppError("Không thể tự thay đổi vai trò của chính mình", 400);
  const updated = await userModel.updateRole(id, req.body.vaiTro);
  if (!updated) throw new AppError("Không tìm thấy người dùng", 404);
  if (req.body.vaiTro !== "admin") await refreshTokenModel.deleteRefreshTokenById(id);
  return res.status(200).json({ message: "Cập nhật vai trò thành công" });
};

const updateStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (id === Number(req.user.id)) throw new AppError("Không thể tự khóa tài khoản đang sử dụng", 400);
  const updated = await userModel.updateStatus(id, req.body.trangThai);
  if (!updated) throw new AppError("Không tìm thấy người dùng", 404);
  if (req.body.trangThai === "khoa") await refreshTokenModel.deleteRefreshTokenById(id);
  return res.status(200).json({ message: "Cập nhật trạng thái tài khoản thành công" });
};

const deleteUser = async (req, res) => {
  const id = Number(req.params.id);
  if (id === Number(req.user.id)) throw new AppError("Không thể tự xóa tài khoản đang sử dụng", 400);
  await userService.deleteUser(id);
  return res.status(200).json({ message: "Xóa tài khoản thành công" });
};

const updatePasswordUser = async (req, res) => {
  await userService.updatePasswordUser(req.params.id, req.body.matKhau);
  await refreshTokenModel.deleteRefreshTokenById(req.params.id);
  return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
};

module.exports = { login, logout, createUser, getProfile, updateProfile, updatePassword, getUsers, getUserById, updateUser, updateRole, updateStatus, deleteUser, updatePasswordUser };
