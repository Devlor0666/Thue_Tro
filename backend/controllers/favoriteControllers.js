const model = require("../models/favoriteModel");
const AppError = require("../utils/AppError");
const list = async (req, res) => res.json({ data: await model.listByUser(req.user.id) });
const add = async (req, res) => {
  if (!(await model.listingIsPublic(req.params.tinDangId))) throw new AppError("Tin đăng không tồn tại hoặc không còn công khai", 404);
  await model.add(req.user.id, req.params.tinDangId);
  return res.status(201).json({ message: "Đã thêm vào danh sách yêu thích" });
};
const remove = async (req, res) => {
  const removed = await model.remove(req.user.id, req.params.tinDangId);
  if (!removed) throw new AppError("Tin đăng chưa có trong danh sách yêu thích", 404);
  return res.json({ message: "Đã bỏ yêu thích" });
};
module.exports = { list, add, remove };
