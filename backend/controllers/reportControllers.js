const model = require("../models/reportModel");
const AppError = require("../utils/AppError");
const create = async (req, res) => {
  const id = await model.create(req.user.id, req.body.tinDangId, req.body.lyDo);
  return res.status(201).json({ message: "Đã gửi báo cáo đến quản trị viên", id });
};
const list = async (req, res) => res.json({ data: await model.list() });
const updateStatus = async (req, res) => {
  const updated = await model.updateStatus(req.params.id, req.body.trangThai);
  if (!updated) throw new AppError("Không tìm thấy báo cáo", 404);
  return res.json({ message: "Cập nhật báo cáo thành công" });
};
module.exports = { create, list, updateStatus };
