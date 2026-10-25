const AppError = require("../utils/AppError");
const jwtMethod = require("../utils/jwt");
const userModel = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return next(new AppError("Vui lòng đăng nhập để tiếp tục", 401));

  const [type, token, ...extra] = authorization.trim().split(/\s+/);
  if (type !== "Bearer" || !token || extra.length) {
    return next(new AppError("Authorization header không hợp lệ", 401));
  }

  let payload;
  try {
    payload = jwtMethod.verifyAccessToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access token đã hết hạn", 401));
    }
    return next(new AppError("Access token không hợp lệ", 401));
  }

  try {
    // Đọc trạng thái và vai trò mới nhất từ DB để việc khóa tài khoản hoặc
    // hạ quyền admin có hiệu lực ngay, không phải chờ access token hết hạn.
    const account = await userModel.getUserById(payload.id);
    if (!account) return next(new AppError("Tài khoản không còn tồn tại", 401));
    if (account.trangThai !== "hoat_dong") {
      return next(new AppError("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên", 403));
    }

    req.user = {
      id: account.id,
      hoTen: account.hoTen,
      email: account.email,
      soDienThoai: account.soDienThoai,
      vaiTro: account.vaiTro,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
