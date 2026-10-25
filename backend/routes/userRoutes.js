const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const refreshTokenController = require("../controllers/refreshTokenControllers");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const schema = require("../validations/validations");

router.post("/login", validate(schema.loginSchema), asyncHandler(userControllers.login));
router.post("/register", validate(schema.createUserSchema), asyncHandler(userControllers.createUser));
router.post("/logout", asyncHandler(userControllers.logout));
router.post("/refresh-token", asyncHandler(refreshTokenController.refreshToken));

router.get("/profile", authMiddleware, asyncHandler(userControllers.getProfile));
router.patch("/profile", authMiddleware, validate(schema.updateUserSchema), asyncHandler(userControllers.updateProfile));
router.patch("/update-password", authMiddleware, validate(schema.updatePasswordSchema), asyncHandler(userControllers.updatePassword));

router.get("/", authMiddleware, adminMiddleware, asyncHandler(userControllers.getUsers));
router.get("/:id", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), asyncHandler(userControllers.getUserById));
router.patch("/:id/update-user", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), validate(schema.updateUserSchema), asyncHandler(userControllers.updateUser));
router.patch("/:id/update-password", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), validate(schema.updatePasswordByAdminSchema), asyncHandler(userControllers.updatePasswordUser));
router.patch("/:id/role", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), validate(schema.updateRoleSchema), asyncHandler(userControllers.updateRole));
router.patch("/:id/status", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), validate(schema.updateStatusSchema), asyncHandler(userControllers.updateStatus));
router.delete("/:id/delete-user", authMiddleware, adminMiddleware, validate(schema.idSchema, "params"), asyncHandler(userControllers.deleteUser));

module.exports = router;
