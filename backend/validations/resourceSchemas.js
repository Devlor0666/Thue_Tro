const Joi = require("joi");

const id = Joi.number().integer().positive();
const roomCreateSchema = Joi.object({
  tieuDe: Joi.string().trim().min(5).max(255).required(),
  diaChi: Joi.string().trim().min(5).max(255).required(),
  diaChiTinh: Joi.string().trim().min(2).max(100).required(),
  diaChiXa: Joi.string().trim().min(2).max(100).required(),
  dienTich: Joi.number().positive().max(100000).required(),
  giaThue: Joi.number().min(0).max(1000000000).required(),
  moTa: Joi.string().allow("").max(10000).optional(),
  moTaTinDang: Joi.string().allow("").max(10000).optional(),
  anhPhong: Joi.array().items(Joi.string().trim().min(1).max(500)).max(10).optional(),
});
const roomUpdateSchema = Joi.object({
  tieuDe: Joi.string().trim().min(5).max(255),
  diaChi: Joi.string().trim().min(5).max(255),
  diaChiTinh: Joi.string().trim().min(2).max(100),
  diaChiXa: Joi.string().trim().min(2).max(100),
  dienTich: Joi.number().positive().max(100000),
  giaThue: Joi.number().min(0).max(1000000000),
  moTa: Joi.string().allow("").max(10000),
  moTaTinDang: Joi.string().allow("").max(10000),
  trangThai: Joi.string().valid("trong", "da_thue", "bao_tri"),
  anhPhong: Joi.array().items(Joi.string().trim().min(1).max(500)).max(10),
}).min(1);
const listingStatusSchema = Joi.object({ trangThai: Joi.string().valid("cho_duyet", "da_dang", "da_an", "tu_choi").required() });
const favoriteParamsSchema = Joi.object({ tinDangId: id.required() });
const reportSchema = Joi.object({ tinDangId: id.required(), lyDo: Joi.string().trim().min(5).max(255).required() });
const reportStatusSchema = Joi.object({ trangThai: Joi.string().valid("cho_xu_ly", "da_xu_ly", "tu_choi").required() });
const reviewSchema = Joi.object({ soSao: Joi.number().integer().min(1).max(5).required(), binhLuan: Joi.string().trim().allow("").max(2000) });
const reviewParamsSchema = Joi.object({ id: id.required() });
const messageParamsSchema = Joi.object({ phongId: id.required() });
const invoiceParamsSchema = Joi.object({ hoaDonId: id.required() });
const messageSchema = Joi.object({ nguoiNhanId: id.optional(), noiDung: Joi.string().trim().min(1).max(5000).required() });
const contractCreateSchema = Joi.object({
  phongId: id.required(),
  ngayBatDau: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  ngayKetThuc: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  tienCoc: Joi.number().min(0).max(1000000000).required(),
});
const contractParamsSchema = Joi.object({ id: id.required() });
const contractStatusSchema = Joi.object({ trangThai: Joi.string().valid("hieu_luc", "da_huy", "het_han").required() });
const invoiceCreateSchema = Joi.object({
  hopDongId: id.required(),
  thang: Joi.number().integer().min(1).max(12).required(),
  nam: Joi.number().integer().min(2000).max(2200).required(),
  tienPhong: Joi.number().min(0).max(1000000000).optional(),
  tienDien: Joi.number().min(0).max(1000000000).default(0),
  tienNuoc: Joi.number().min(0).max(1000000000).default(0),
  khoanKhac: Joi.number().min(0).max(1000000000).default(0),
  hanThanhToan: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});
const invoiceStatusSchema = Joi.object({ trangThai: Joi.string().valid("chua_thanh_toan", "da_thanh_toan", "qua_han").required() });
const transactionCreateSchema = Joi.object({
  phuongThuc: Joi.string().valid("tien_mat", "chuyen_khoan", "vi_dien_tu").required(),
  soTien: Joi.number().positive().max(1000000000).required(),
});
const transactionStatusSchema = Joi.object({ trangThai: Joi.string().valid("thanh_cong", "that_bai", "hoan_tien").required() });

module.exports = {
  roomCreateSchema, roomUpdateSchema, listingStatusSchema, favoriteParamsSchema,
  reportSchema, reportStatusSchema, reviewSchema, reviewParamsSchema,
  messageParamsSchema, invoiceParamsSchema, messageSchema, contractCreateSchema, contractParamsSchema,
  contractStatusSchema, invoiceCreateSchema, invoiceStatusSchema,
  transactionCreateSchema, transactionStatusSchema,
};
