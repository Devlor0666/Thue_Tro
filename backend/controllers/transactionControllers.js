const model = require("../models/transactionModel");
const AppError = require("../utils/AppError");
const list = async (req, res) => res.json({ data: await model.listByUser(req.user.id, req.user.vaiTro === "admin") });
const create = async (req, res) => {
  const id = await model.create(req.params.hoaDonId, req.user.id, req.body.phuongThuc, req.body.soTien);
  return res.status(201).json({ message: "Đã gửi giao dịch, đang chờ chủ trọ xác nhận", id });
};
const updateStatus = async (req, res) => {
  const transaction = await model.getById(req.params.id);
  if (!transaction) throw new AppError("Không tìm thấy giao dịch", 404);
  if (req.user.vaiTro !== "admin" && Number(transaction.chuTroId) !== Number(req.user.id)) throw new AppError("Chỉ chủ trọ hoặc admin mới được xác nhận giao dịch", 403);
  if (transaction.trangThai !== "cho_xu_ly") throw new AppError("Chỉ giao dịch đang chờ mới được cập nhật", 409);
  await model.updateStatus(req.params.id, req.body.trangThai);
  return res.json({ message: "Cập nhật giao dịch thành công" });
};
module.exports = { list, create, updateStatus };
