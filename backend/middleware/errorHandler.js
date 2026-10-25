const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Đã xảy ra lỗi máy chủ";

  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Dữ liệu đã tồn tại (email, số điện thoại hoặc bản ghi bị trùng)";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Dữ liệu liên quan không tồn tại";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message = "Không thể xóa vì dữ liệu đang được sử dụng ở chức năng khác";
  } else if (!err.statusCode && err.code) {
    statusCode = 500;
    message = "Lỗi cơ sở dữ liệu";
  } else if (!err.statusCode && process.env.NODE_ENV === "production") {
    message = "Đã xảy ra lỗi máy chủ";
  }

  if (statusCode >= 500) console.error(err);
  return res.status(statusCode).json({ message });
};

module.exports = errorHandler;
