const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // URL ของ React Frontend
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};
  const readyList = {
    user : [],
    status : ""
  };
  io.on("connection", (socket) => {
    // console.log("A user connected:", socket.id);

    // เมื่อผู้ใช้เข้าร่วมห้อง
    socket.on("join_room", (roomId, users) => {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      if (!rooms[roomId].some((user) => JSON.stringify(user) === JSON.stringify(users))) {
        rooms[roomId].push(users);
      }
      socket.join(roomId);
      // console.log(`User ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("user_joined", {
        user: rooms[roomId], //user in room
        roomId,

      });
    });

    socket.on("leave_room", (roomId, users) => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((user) => user.user_id !== users.user_id);
        io.to(roomId).emit("user_joined", {
          user: rooms[roomId],
        });
      }
    });

    // เมื่อผู้ใช้เปลี่ยนสถานะเป็น Ready หรือ Unready
    socket.on("set_ready_status", ({ roomId, user, status }) => {
      console.log(
        `User ${user.username} in room ${roomId} is now ${status ? "Ready" : "Unready"}`
      );
      if (!readyList[roomId].some((user) => JSON.stringify(user) === JSON.stringify(users))) {
        readyList[roomId].push(users);
      }
      io.to(roomId).emit("update_ready_status", { 
        user, 
        status 
      });
    });

    // เมื่อผู้ใช้ตัดการเชื่อมต่อ
    socket.on("disconnect", () => {
      // console.log(`A user disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocket;
