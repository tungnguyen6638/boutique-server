const io = require("../socket");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");

// Controller để GET toàn bộ room chat
exports.getRooms = (req, res, next) => {
  ChatRoom.find()
    .then((result) => {
      res.status(200).json({ message: "Success", chatRooms: result });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// Controller để GET một room chat
exports.getChatRoom = (req, res, next) => {
  const roomId = req.params.roomId;
  ChatRoom.findOne({ _id: new Object(roomId) })
    .then((result) => {
      if (result) {
        return res
          .status(201)
          .json({ message: "Found room", chatRoom: result });
      } else {
        return res.sendStatus(404);
      }
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};
