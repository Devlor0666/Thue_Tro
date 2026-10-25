const roomModel = require("../models/roomModel");
const AppError = require("../utils/AppError");

const listRooms = async (req, res) => {
  const result = await roomModel.listRooms(req.query);
  return res.json(result);
};

const getRoom = async (req, res) => {
  const room = await roomModel.getRoomById(req.params.id);
  if (!room) throw new AppError("Không tìm thấy phòng đang được đăng hoặc phòng không còn trống", 404);
  return res.json({ room });
};

const getMyRooms = async (req, res) => res.json({ data: await roomModel.getMyRooms(req.user.id) });

const getMyRoom = async (req, res) => {
  const room = await roomModel.getMyRoomDetail(req.params.id);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  if (Number(room.chuTroId) !== Number(req.user.id) && req.user.vaiTro !== "admin") {
    throw new AppError("Bạn không có quyền xem thông tin quản lý phòng này", 403);
  }
  return res.json({ room });
};

const createRoom = async (req, res) => {
  const result = await roomModel.createRoom(req.user.id, req.body);
  return res.status(201).json({ message: "Đã gửi phòng để quản trị viên duyệt", ...result });
};

const updateRoom = async (req, res) => {
  const room = await roomModel.getRoomOwner(req.params.id);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  if (Number(room.chuTroId) !== Number(req.user.id) && req.user.vaiTro !== "admin") throw new AppError("Bạn không có quyền sửa phòng này", 403);
  if (room.trangThai === "da_thue" && req.user.vaiTro !== "admin") throw new AppError("Phòng đang có hợp đồng hiệu lực; hãy kết thúc hợp đồng trước khi chỉnh sửa", 409);
  if (req.body.trangThai === "da_thue" && req.user.vaiTro !== "admin") throw new AppError("Trạng thái đã thuê chỉ được cập nhật thông qua hợp đồng", 400);
  await roomModel.updateRoom(req.params.id, req.body);
  return res.json({ message: "Cập nhật phòng thành công. Tin đăng sẽ được duyệt lại nếu có thay đổi nội dung" });
};

const hideRoom = async (req, res) => {
  const room = await roomModel.getRoomOwner(req.params.id);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  if (Number(room.chuTroId) !== Number(req.user.id) && req.user.vaiTro !== "admin") throw new AppError("Bạn không có quyền ẩn phòng này", 403);
  await roomModel.hideRoom(req.params.id);
  return res.json({ message: "Đã ẩn phòng và tin đăng" });
};

const getListings = async (req, res) => res.json({ data: await roomModel.getListings() });

const updateListingStatus = async (req, res) => {
  const updated = await roomModel.setListingStatus(req.params.id, req.body.trangThai);
  if (!updated) throw new AppError("Không tìm thấy tin đăng", 404);
  return res.json({ message: "Cập nhật trạng thái tin đăng thành công" });
};

module.exports = { listRooms, getRoom, getMyRooms, getMyRoom, createRoom, updateRoom, hideRoom, getListings, updateListingStatus };
