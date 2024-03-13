const express = require("express");

const { hasUser } = require("../middleware/has-user");

const supportController = require("../controllers/support");

const router = express.Router();

router.get("/chat-rooms", supportController.getRooms);

router.get("/chat-room/:roomId", supportController.getChatRoom);

module.exports = router;
