const ChatRoom = require("../models/ChatRoom");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// const User = require("../models/User");
const io = require("../socket");

const chatHandler = (socket) => {
  socket.on("chat", (c) => {
    // Từ client gửi đến
    if (c.action === "req-from-client") {
      // Tìm room trên database
      ChatRoom.find({ _id: new ObjectId(c.roomId) })
        .then((result) => {
          // Nếu không có room nào thì tạo mới
          if (result.length === 0) {
            const newChatRoom = new ChatRoom({
              chatMessages: [{ role: "client", message: c.message }],
            });

            // Sau khi tạo thì gửi roomId qua cho client
            return newChatRoom.save().then((result) => {
              emitMessage(socket, result._id, result.chatMessages);
              io.getIO().emit("chat", {
                action: "res-to-admin",
                room: result,
              });
            });

            // Nếu đã có room thì push tiếp tin nhắn vào mảng chatMessaages của room đó
          } else {
            result[0].chatMessages.push({
              role: "client",
              message: c.message,
            });

            return result[0].save().then((result) => {
              // Và emit lại cho client roomId với mảng messages để client render
              emitMessage(socket, result._id, result.chatMessages);
              io.getIO().emit("chat", {
                action: "res-to-admin",
                room: result,
              });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Từ admin gửi đến
    if (c.action === "req-from-admin") {
      ChatRoom.findById(c.roomId)
        .then((result) => {
          result.chatMessages.push({
            role: "admin",
            message: c.message,
          });

          return result.save().then((result) => {
            io.getIO().emit("chat", {
              action: "res-to-all",
              room: result,
            });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Khi action là delete
    if (c.action === "req-delete-from-client") {
      // Tìm roomchat đó và xóa nó xong emit tới toàn bộ client
      ChatRoom.findByIdAndDelete(c.roomId)
        .then((result) => {
          return io.getIO().emit("chat", {
            action: "res-delete-to-all",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

function emitMessage(socket, roomId, messages) {
  socket.emit("chat", {
    action: "res-to-client",
    messages: messages || null,
    roomId: roomId,
  });
}

exports.chatHandler = chatHandler;
