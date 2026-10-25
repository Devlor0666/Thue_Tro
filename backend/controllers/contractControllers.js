const model = require("../models/contractModel");
const AppError = require("../utils/AppError");
const list = async (req, res) => res.json({ data: await model.listByUser(req.user.id, req.user.vaiTro === "admin") });
const create = async (req, res) => {
  const id = await model.create(req.user.id, req.body);
  return res.status(201).json({ message: "Đã gửi yêu cầu thuê cho chủ trọ", id });
};
const updateStatus = async (req, res) => {
  const contract = await model.getById(req.params.id);
  if (!contract) throw new AppError("Không tìm thấy hợp đồng", 404);
  const actorId = Number(req.user.id);
  const isAdmin = req.user.vaiTro === "admin";
  const isOwner = Number(contract.chuTroId) === actorId;
  const isTenant = Number(contract.nguoiThueId) === actorId;
  const nextStatus = req.body.trangThai;
  if (nextStatus === "hieu_luc" && !isOwner && !isAdmin) throw new AppError("Chỉ chủ trọ hoặc admin được duyệt hợp đồng", 403);
  if (nextStatus === "het_han" && !isOwner && !isAdmin) throw new AppError("Chỉ chủ trọ hoặc admin được kết thúc hợp đồng", 403);
  if (nextStatus === "da_huy" && !isOwner && !isTenant && !isAdmin) throw new AppError("Bạn không có quyền hủy hợp đồng này", 403);
  if (nextStatus === "da_huy" && !isAdmin && contract.trangThai !== "cho_hieu_luc") throw new AppError("Chỉ có thể hủy yêu cầu khi hợp đồng đang chờ duyệt", 409);
  if (nextStatus === "hieu_luc" && contract.trangThai !== "cho_hieu_luc") throw new AppError("Chỉ yêu cầu đang chờ mới có thể được duyệt", 409);
  if (nextStatus === "het_han" && contract.trangThai !== "hieu_luc") throw new AppError("Chỉ hợp đồng đang có hiệu lực mới có thể kết thúc", 409);
  await model.updateStatus(req.params.id, nextStatus);
  return res.json({ message: "Cập nhật hợp đồng thành công" });
};
module.exports = { list, create, updateStatus };
