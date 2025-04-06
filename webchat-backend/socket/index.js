const Message = require("../models/Message");

const usersInRoom = {};

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (room, username) => {
      const currentRooms = Array.from(socket.rooms);
      currentRooms.forEach((r) => {
        if (r !== socket.id) {
          socket.leave(r);
          if (usersInRoom[r]) {
            usersInRoom[r] = usersInRoom[r].filter((user) => user.id !== socket.id);
            if (usersInRoom[r].length === 0) delete usersInRoom[r];
            io.to(r).emit("updateUsers", usersInRoom[r] || []);
          }
        }
      });

      socket.join(room);
      if (!usersInRoom[room]) usersInRoom[room] = [];
      usersInRoom[room].push({ id: socket.id, username });
      io.to(room).emit("updateUsers", usersInRoom[room]);

      Message.find({ room })
        .then((messages) => socket.emit("load_messages", messages))
        .catch((err) => console.error("Error loading messages:", err));
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      if (usersInRoom[room]) {
        usersInRoom[room] = usersInRoom[room].filter((user) => user.id !== socket.id);
        if (usersInRoom[room].length === 0) delete usersInRoom[room];
        io.to(room).emit("updateUsers", usersInRoom[room] || []);
      }
    });

    socket.on("chatMessage", async (messageData) => {
      console.log("📥 chatMessage received:", messageData);
      try {
        const { text, sender, room, image } = messageData;

        if ((!text || text.trim() === "") && !image) {
          console.log("Message must have text or image.");
          return;
        }
        

        const newMessage = new Message({
          text: text || "",
          image: image && !image.startsWith("/uploads/") ? `/uploads/${image}` : image || "",
          sender,
          room,
          timestamp: new Date(),
        });
        console.log("✅ newMessage created:", newMessage);

        await newMessage.save();
        
        io.to(room).emit("chatMessage", newMessage); // Emit tin nhắn mới cho phòng


      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      for (let room in usersInRoom) {
        usersInRoom[room] = usersInRoom[room].filter((user) => user.id !== socket.id);
        if (usersInRoom[room].length === 0) delete usersInRoom[room];
        io.to(room).emit("updateUsers", usersInRoom[room] || []);
      }
    });
  });
};
