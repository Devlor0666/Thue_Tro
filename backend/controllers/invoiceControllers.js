const model = require("../models/invoiceModel");
const AppError = require("../utils/AppError");
const list = async (req, res) => res.json({ data: await model.listByUser(req.user.id, req.user.vaiTro === "admin") });
const create = async (req, res) => {
  const result = await model.create(req.user.id, req.user.vaiTro === "admin", req.body);
  return res.status(201).json({ message: "Tạo hóa đơn thành công", ...result });
};
const updateStatus = async (req, res) => {
  const invoice = await model.getById(req.params.id);
  if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);
  if (req.user.vaiTro !== "admin" && Number(invoice.chuTroId) !== Number(req.user.id)) throw new AppError("Chỉ chủ trọ hoặc admin mới được cập nhật trạng thái hóa đơn", 403);
  if (invoice.trangThai === "da_thanh_toan" && req.body.trangThai !== "da_thanh_toan") throw new AppError("Hóa đơn đã thanh toán, hãy xử lý qua giao dịch hoàn tiền nếu cần", 409);
  const updated = await model.updateStatus(req.params.id, req.body.trangThai);
  if (!updated) throw new AppError("Không thể cập nhật hóa đơn", 404);
  return res.json({ message: "Cập nhật hóa đơn thành công" });
};
module.exports = { list, create, updateStatus };
