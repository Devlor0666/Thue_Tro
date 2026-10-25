const model = require("../models/reviewModel");
const roomModel = require("../models/roomModel");
const AppError = require("../utils/AppError");
const list = async (req, res) => res.json({ data: await model.listByRoom(req.params.id) });
const create = async (req, res) => {
  const room = await roomModel.getRoomOwner(req.params.id);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  if (Number(room.chuTroId) === Number(req.user.id)) throw new AppError("Chủ trọ không thể tự đánh giá phòng của mình", 400);
  if (!(await model.hasRented(req.user.id, req.params.id))) throw new AppError("Chỉ người đã thuê phòng mới được đánh giá", 403);
  const id = await model.save(req.user.id, req.params.id, req.body.soSao, req.body.binhLuan);
  return res.status(201).json({ message: "Lưu đánh giá thành công", id });
};
module.exports = { list, create };
