const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST"]
  }
});

let users = []; // เก็บรายชื่อผู้ใช้ในห้อง

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // เมื่อผู้ใช้เข้าร่วมห้อง
  socket.on("join_room", (username) => {
    const user = { id: socket.id, name: username };
    users.push(user);
    console.log(`${username} joined the room.`);
    io.emit("update_users", users); // ส่งรายชื่อผู้ใช้ทั้งหมดให้ทุกคน
  });

  // เมื่อผู้ใช้ตัดการเชื่อมต่อ
  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    console.log(`A user disconnected: ${socket.id}`);
    io.emit("update_users", users); // ส่งรายชื่อที่อัปเดต
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 3000");
});
