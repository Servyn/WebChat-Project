const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Cho phép truy cập ảnh trong thư mục uploads
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');  // Cho phép tất cả các origin
  }
}));




mongoose.connect('mongodb+srv://cuong:cuong13@cluster0.iwp4d.mongodb.net/webchat?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

  

// WebSocket server (Socket.IO)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { text, sender, room } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const newMessage = new Message({ text, image, sender, room });
    await newMessage.save();

    console.log(`📩 Gửi tin nhắn đến phòng: ${room}`);

    // ✅ Chỉ gửi tin nhắn đến đúng phòng
    io.to(room).emit("chatMessage", { text, image, sender, room });

    res.status(200).json({ success: true, imageUrl: image });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
  }
});

const usersInRoom = {};


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    const currentRooms = Array.from(socket.rooms);
    
    // Rời khỏi tất cả các phòng mà socket đang tham gia
    currentRooms.forEach(r => {
      if (r !== socket.id) {
        socket.leave(r); 
        if (usersInRoom[r]) {
          usersInRoom[r] = usersInRoom[r].filter(id => id !== socket.id);
          if (usersInRoom[r].length === 0) delete usersInRoom[r]; // Xóa phòng trống
          io.to(r).emit("updateUsers", usersInRoom[r] || []);
        }
      }
    });

    // Tham gia phòng mới
    socket.join(room);
    if (!usersInRoom[room]) usersInRoom[room] = [];
    usersInRoom[room].push(socket.id);

    console.log(`${socket.id} joined room ${room}`);
    io.to(room).emit("updateUsers", usersInRoom[room]);

    // Gửi tất cả tin nhắn cũ trong phòng này khi người dùng kết nối
    Message.find({ room }).then((messages) => {
      socket.emit("load_messages", messages); 
    }).catch((err) => {
      console.error("Error loading messages:", err);
    });
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`🚪 ${socket.id} rời phòng ${room}`);

    // Cập nhật danh sách người dùng trong phòng đã rời
    if (usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter(id => id !== socket.id);
      if (usersInRoom[room].length === 0) delete usersInRoom[room]; // Xóa phòng trống
    }

    io.to(room).emit("updateUsers", usersInRoom[room] || []);
  });

  
  // Xử lý khi có tin nhắn mới từ client
  socket.on("chatMessage", async (messageData) => {
    try {
      const { text, sender, room, image } = messageData;
      const newMessage = new Message({
        text: text || "",
        image: image || "",
        sender,
        room,
        timestamp: new Date(),
      });

      await newMessage.save();
      console.log("Message saved to MongoDB");

      io.to(room).emit("chatMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} đã ngắt kết nối`);

    for (let room in usersInRoom) {
      usersInRoom[room] = usersInRoom[room].filter(id => id !== socket.id);
      if (usersInRoom[room].length === 0) {
        delete usersInRoom[room]; 
      }
      io.to(room).emit("updateUsers", usersInRoom[room] || []);
    }
  });

});


// Start the server
server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
