const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/auth");

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);



app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

mongoose.connect('mongodb+srv://cuong:cuong13@cluster0.iwp4d.mongodb.net/webchat?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

require("./socket")(io);

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
