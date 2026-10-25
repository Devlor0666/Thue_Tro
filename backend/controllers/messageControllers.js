const model = require("../models/messageModel");
const AppError = require("../utils/AppError");
const inbox = async (req, res) => res.json({ data: await model.listInbox(req.user.id) });

const list = async (req, res) => {
  const room = await model.getRoom(req.params.phongId);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  const peerId = Number(req.query.doiTacId);
  if (!Number.isInteger(peerId) || peerId <= 0 || peerId === Number(req.user.id)) {
    throw new AppError("Mã người trò chuyện không hợp lệ", 400);
  }
  const isOwner = Number(room.chuTroId) === Number(req.user.id);
  if (isOwner) {
    if (!(await model.isParticipant(req.params.phongId, peerId))) {
      throw new AppError("Người này chưa tham gia cuộc trò chuyện của phòng", 403);
    }
  } else if (peerId !== Number(room.chuTroId)) {
    throw new AppError("Bạn chỉ có thể xem cuộc trò chuyện với chủ trọ", 403);
  }
  const isParticipant = await model.isParticipant(req.params.phongId, req.user.id);
  if (!isOwner && !isParticipant) throw new AppError("Bạn không có quyền xem cuộc trò chuyện này", 403);
  await model.markRead(req.params.phongId, req.user.id, peerId);
  return res.json({ data: await model.listByRoom(req.params.phongId, req.user.id, peerId) });
};
const send = async (req, res) => {
  const room = await model.getRoom(req.params.phongId);
  if (!room) throw new AppError("Không tìm thấy phòng", 404);
  const senderId = Number(req.user.id);
  const recipientId = Number(req.body.nguoiNhanId || room.chuTroId);
  if (recipientId === senderId) throw new AppError("Không thể gửi tin nhắn cho chính mình", 400);
  const isOwner = Number(room.chuTroId) === senderId;
  if (!isOwner && recipientId !== Number(room.chuTroId)) throw new AppError("Tin nhắn đầu tiên cần gửi cho chủ trọ", 400);
  if (isOwner && !(await model.isParticipant(req.params.phongId, recipientId))) throw new AppError("Bạn chỉ có thể trả lời người đã liên hệ với phòng này", 403);
  const id = await model.send(req.params.phongId, senderId, recipientId, req.body.noiDung.trim());
  return res.status(201).json({ message: "Gửi tin nhắn thành công", id });
};
module.exports = { inbox, list, send };
