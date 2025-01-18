const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // URL ของ React Frontend
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // เมื่อผู้ใช้เข้าร่วมห้อง
    socket.on("join_room", (roomId, user_id) => {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      if (!rooms[roomId].includes(user_id)) {
        rooms[roomId].push(user_id);
      }

      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("user_joined", {
        userId: rooms[roomId], //user in room
        roomId,
      });
    });

    socket.on("leave_room", (roomId, userId) => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
        io.to(roomId).emit("user_joined", {
          userId: rooms[roomId],
        });
      }
    });

    // เมื่อผู้ใช้ตัดการเชื่อมต่อ
    socket.on("disconnect", () => {
      console.log(`A user disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocket;
