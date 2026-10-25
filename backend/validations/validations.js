const Joi = require("joi");

const createUserSchema = Joi.object({
  hoTen: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(255).required(),
  matKhau: Joi.string().min(8).max(72).required(),
  soDienThoai: Joi.string().pattern(/^[0-9]{10}$/).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
  matKhau: Joi.string().min(8).max(72).required(),
});

const updateUserSchema = Joi.object({
  hoTen: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().email().max(255),
  soDienThoai: Joi.string().pattern(/^[0-9]{10}$/),
}).min(1);

const idSchema = Joi.object({ id: Joi.number().integer().positive().required() });
const updateRoleSchema = Joi.object({ vaiTro: Joi.string().valid("user", "admin").required() });
const updateStatusSchema = Joi.object({ trangThai: Joi.string().valid("hoat_dong", "khoa").required() });
const updatePasswordSchema = Joi.object({
  matKhauCu: Joi.string().min(8).max(72).required(),
  matKhau: Joi.string().min(8).max(72).required(),
});
const updatePasswordByAdminSchema = Joi.object({ matKhau: Joi.string().min(8).max(72).required() });
const refreshTokenSchema = Joi.object({});

module.exports = { createUserSchema, loginSchema, updateUserSchema, idSchema, updateRoleSchema, updateStatusSchema, updatePasswordSchema, updatePasswordByAdminSchema, refreshTokenSchema };
