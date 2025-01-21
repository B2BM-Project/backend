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
    // console.log("A user connected:", socket.id);

    // เมื่อผู้ใช้เข้าร่วมห้อง
    socket.on("join_room", (roomId, users) => {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      users.ready_status = false;
      if (!rooms[roomId].some(
          (existingUser) => existingUser.user_id === users.user_id
        )
      ) {
        rooms[roomId].push(users);
      }
      socket.join(roomId);
      // console.log(`User ${socket.id} joined room ${roomId}`);
      console.log( "###################\n", rooms, "\n###################");
      io.to(roomId).emit("user_joined", {
        user: rooms[roomId], //user in room
        roomId,
      });
    });

    socket.on("leave_room", (roomId, users) => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(
          (user) => user.user_id !== users.user_id
        );
        console.log( "^^^^^^^^^^^^^^^^^^^\n", rooms, "\n^^^^^^^^^^^^^^^^^^^");
        io.to(roomId).emit("user_joined", {
          user: rooms[roomId],
          roomId,
        });
      }
    });

    // เมื่อผู้ใช้เปลี่ยนสถานะเป็น Ready หรือ Unready
    socket.on("set_ready_status", ({ roomId, user, status }) => {
      console.log(
        `User ${user.username} in room ${roomId} is now ${
          status ? "Ready" : "Unready"
        }`
      );
      // user.ready_status = status;
      const userIndex = rooms[roomId].findIndex(
        (u) => u.user_id === user.user_id
      );
      if (userIndex !== -1) {
        rooms[roomId][userIndex].ready_status = status;
      } else {
        console.error(
          `User with id ${user.user_id} not found in room ${roomId}`
        );
      }
      // console.log("*********************\n", rooms, "\n*********************");
      
      io.to(roomId).emit("update_ready_status", {
        user: rooms[roomId],
      });
    });
  });
}

module.exports = initializeSocket;
