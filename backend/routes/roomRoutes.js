const express = require("express");
const router = express.Router();
const controller = require("../controllers/roomControllers");
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const schema = require("../validations/resourceSchemas");
const paramsSchema = require("../validations/validations");

router.get("/", asyncHandler(controller.listRooms));
router.get("/mine", auth, asyncHandler(controller.getMyRooms));
router.get("/mine/:id", auth, validate(paramsSchema.idSchema, "params"), asyncHandler(controller.getMyRoom));
router.post("/", auth, validate(schema.roomCreateSchema), asyncHandler(controller.createRoom));
router.get("/:id", validate(paramsSchema.idSchema, "params"), asyncHandler(controller.getRoom));
router.patch("/:id", auth, validate(paramsSchema.idSchema, "params"), validate(schema.roomUpdateSchema), asyncHandler(controller.updateRoom));
router.delete("/:id", auth, validate(paramsSchema.idSchema, "params"), asyncHandler(controller.hideRoom));

module.exports = router;
