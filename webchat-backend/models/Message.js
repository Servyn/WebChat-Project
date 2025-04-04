const mongoose = require("mongoose");

// Định nghĩa schema
const messageSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  image: { type: String, default: "" },
  sender: { type: String, required: true },
  room: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Tạo model từ schema
const Message = mongoose.model("Message", messageSchema);

// Export model
module.exports = Message;
