const { Server } = require("socket.io");

let users = []; // เก็บผู้ใช้ในระบบ

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // URL ของ React Frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // เมื่อผู้ใช้เข้าร่วมห้อง
    socket.on("join_room", (username) => {
      const user = { id: socket.id, name: username };
      users.push(user);
      console.log(`${username} joined the room.`);
      io.emit("update_users", users); // ส่งรายชื่อผู้ใช้ทั้งหมดให้ทุกคน
    });

    // เมื่อผู้ใช้ออกจากห้อง
    socket.on("leave_room", () => {
      users = users.filter((user) => user.id !== socket.id);
      console.log(`User ${socket.id} left the room.`);
      io.emit("update_users", users); // ส่งรายชื่อผู้ใช้อัปเดตให้ทุกคน
    });

    // เมื่อผู้ใช้ตัดการเชื่อมต่อ
    socket.on("disconnect", () => {
      users = users.filter((user) => user.id !== socket.id);
      console.log(`A user disconnected: ${socket.id}`);
      io.emit("update_users", users); // ส่งรายชื่อผู้ใช้อัปเดต
    });
  });
}

module.exports = initializeSocket;
