const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  chatMessages: [
    {
      role: {
        type: String,
        required: false,
      },
      message: {
        type: String,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
