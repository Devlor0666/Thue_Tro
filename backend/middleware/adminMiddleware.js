const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  if (!req.user || req.user.vaiTro !== "admin") {
    return next(new AppError("Bạn không có quyền thực hiện chức năng này", 403));
  }
  return next();
};
