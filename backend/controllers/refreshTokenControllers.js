const jwtMethod = require("../utils/jwt");
const userModels = require("../models/userModel");
const refreshTokenModels = require("../models/refreshTokenModel");
const AppError = require("../utils/AppError");

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError("Không tìm thấy refresh token. Vui lòng đăng nhập lại", 401);

  let decoded;
  try {
    decoded = jwtMethod.verifyRefreshToken(token);
  } catch (error) {
    throw new AppError("Refresh token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại", 401);
  }

  const savedToken = await refreshTokenModels.getRefreshTokenByUserId(decoded.id);
  if (!savedToken || savedToken.token !== token || new Date(savedToken.ngayHetHan) <= new Date()) {
    throw new AppError("Refresh token đã bị thu hồi hoặc hết hạn", 401);
  }

  const user = await userModels.getUserById(decoded.id);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);
  if (user.trangThai !== "hoat_dong") throw new AppError("Tài khoản đã bị khóa", 403);

  const payload = { id: user.id, hoTen: user.hoTen, email: user.email, soDienThoai: user.soDienThoai, vaiTro: user.vaiTro };
  const accessToken = jwtMethod.createAccessToken(payload);
  return res.status(200).json({ message: "Làm mới phiên đăng nhập thành công", accessToken, user: payload });
};

module.exports = { refreshToken };
