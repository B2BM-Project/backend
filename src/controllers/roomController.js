const pool = require("../config/database");
const { verifyToken, createToken } = require("./jwtHelper"); // นำเข้า jwtHelper

// สร้างห้องใหม่
// สร้างห้องใหม่
exports.createRoom = async (req, res) => {
  const { Room_name, Room_description, Room_password, status, duration } =
    req.body; // ไม่รับ owner จาก req.body

  // ดึง token จาก Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    // ตรวจสอบและถอดรหัส JWT
    const decoded = await verifyToken(token);
    console.log("Decoded Token:", decoded);

    const userId = decoded.userId; // ใช้ userId จาก JWT เป็น owner

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!Room_name || typeof Room_name !== "string") {
      return res
        .status(400)
        .json({ message: "Room_name is required and must be a string" });
    }

    // ตรวจสอบว่าตาราง ROOM_LIST มีอยู่ในฐานข้อมูลหรือไม่
    const [checkTable] = await pool.query(
      "SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'room_list'"
    );
    if (checkTable[0].tableCount === 0) {
      return res
        .status(500)
        .json({ message: "ROOM_LIST table does not exist in the database" });
    }

    // ตรวจสอบและกำหนดค่าของ Room_description, Room_password, status และ duration
    const roomDescription =
      Room_description && typeof Room_description === "string"
        ? Room_description
        : null;
    const roomPassword =
      Room_password && typeof Room_password === "string" ? Room_password : null;
    const roomStatus = status != null ? status : 0;
    const roomDuration =
      duration != null ? duration : 0;

    // สร้างห้องในตาราง ROOM_LIST
    const [result] = await pool.query(
      "INSERT INTO room_list (Room_name, Room_description, Room_password, status, duration, owner) VALUES (?, ?, ?, ?, ?, ?)",
      [
        Room_name,
        roomDescription,
        roomPassword,
        roomStatus,
        roomDuration,
        userId,
      ] // ใช้ userId เป็น owner
    );

    const roomId = result.insertId;

    // เพิ่มผู้ใช้ลงในตาราง attendance_to
    await pool.query(
      "INSERT INTO attendance_to (Room_id, User_id, Score) VALUES (?, ?, ?)",
      [roomId, userId, 0]
    );

    // สร้าง roomToken
    const roomToken = createToken({ userId, Room_id: roomId });

    res.status(201).json({
      message: "Room created successfully",
      roomId,
      roomToken,
    });
  } catch (error) {
    console.error("Error creating room:", error);

    // กำหนดข้อความผิดพลาดตามประเภทของข้อผิดพลาด
    let errorMessage = error.message;
    if (error.code === "ER_BAD_NULL_ERROR") {
      errorMessage = "Invalid input data";
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      errorMessage = "The specified table does not exist in the database";
    }

    res.status(500).json({
      message: "Error creating room",
      error: errorMessage,
    });
  }
};

// ดึง tasks โดยอ้างอิง Room_id
exports.getTasksByRoomId = async (req, res) => {
  const { id } = req.params; // รับ Room_id จาก route

  try {
    // ตรวจสอบว่า Room_id มีอยู่หรือไม่
    const [roomExists] = await pool.query(
      "SELECT * FROM room_list WHERE Room_id = ?",
      [id]
    );
    if (roomExists.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const [rooms] = await pool.query(
      "SELECT * FROM room_list WHERE Room_id = ?",
      [id]
    );
    // ดึง tasks ทั้งหมดที่เกี่ยวข้องกับ Room_id
    const [tasks] = await pool.query(
      "SELECT * FROM task WHERE Room_id = ?",
      [id]
    );
    // แปลง Task_file ให้เป็น Array
    const updatedTasks = tasks.map((task) => {
      const taskFilesArray = task.Task_file.includes(",")
        ? task.Task_file.split(",") // แยก Task_file ด้วยตัวคั่น เช่น ','
        : [task.Task_file]; // ถ้าไม่มีตัวคั่น ให้นำค่าเดิมใส่ใน Array
      return {
        ...task,
        Task_file: taskFilesArray, // เปลี่ยน Task_file เป็น Array
      };
    });
    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks: updatedTasks,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching tasks by Room_id:", error);
    res.status(500).json({
      message: "Error fetching tasks by Room_id",
      error: error.message,
    });
  }
};

// ดึง tasks โดยอ้างอิง Room_name และ Room_password
exports.getTasksByRoomIdAndPassword = async (req, res) => {
  const { Room_id, Room_password } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!Room_id || !Room_password) {
    return res.status(400).json({ message: "Room_id and Room_password are required" });
  }

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    // ตรวจสอบ JWT
    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID in token" });
    }

    // ตรวจสอบว่า Room_id และ Room_password ถูกต้องหรือไม่
    const [room] = await pool.query(
      "SELECT * FROM room_list WHERE Room_id = ? AND Room_password = ?",
      [Room_id, Room_password]
    );

    if (room.length === 0) {
      return res.status(404).json({ message: "Room not found or invalid password" });
    }

    // ตรวจสอบว่า user มีอยู่ใน attendance_to หรือไม่
    const [attendance] = await pool.query(
      "SELECT * FROM attendance_to WHERE Room_id = ? AND User_id = ?",
      [Room_id, userId]
    );

    // ถ้าไม่มี user ใน attendance_to ให้เพิ่มเข้าไป
    if (attendance.length === 0) {
      await pool.query(
        "INSERT INTO attendance_to (Room_id, User_id, Score) VALUES (?, ?, ?)",
        [Room_id, userId, 0]
      );
    }

    // สร้าง roomToken ใหม่ที่มี Room_id
    const roomToken = createToken({ userId, Room_id });

    // ดึง tasks ที่เกี่ยวข้องกับ Room_id
    const [tasks] = await pool.query(
      "SELECT * FROM task WHERE Room_id = ?",
      [Room_id]
    );

    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
      roomToken, // ส่ง roomToken ใหม่
    });
  } catch (error) {
    console.error("Error fetching tasks by Room_id and Room_password:", error);
    res.status(500).json({
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};


// ดึงข้อมูลห้องทั้งหมด
exports.getAllRooms = async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM room_list');
        res.status(200).json({ rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
        // ตรวจสอบ JWT และดึง userId กับ Room_id
        const decoded = await verifyToken(token);
        const userId = decoded.userId;
        const roomId = decoded.Room_id; // ดึง Room_id จาก token

        if (!userId || !roomId) {
            return res.status(400).json({ message: "Invalid token: Missing user ID or Room ID" });
        }

        // ตรวจสอบว่า user เป็นเจ้าของห้องหรือไม่
        const [room] = await pool.query(
            "SELECT * FROM room_list WHERE Room_id = ? AND owner = ?",
            [roomId, userId]
        );

        if (room.length === 0) {
            return res.status(403).json({ message: "You are not authorized to delete this room or room does not exist" });
        }

        // ลบ Tasks ที่เกี่ยวข้องกับห้องนี้
        await pool.query("DELETE FROM task WHERE Room_id = ?", [roomId]);

        // ลบ Attendance (คนที่เข้าร่วมห้องนี้)
        await pool.query("DELETE FROM attendance_to WHERE Room_id = ?", [roomId]);

        // ลบห้องจาก room_list
        await pool.query("DELETE FROM room_list WHERE Room_id = ?", [roomId]);

        res.status(200).json({ message: "Room deleted successfully" });

    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Error deleting room", error: error.message });
    }
};



// ดึงคะแนนของทุกคนใน room เดียวกัน
exports.getRoomScores = async (req, res) => {
    const { room_id } = req.params;

    try {
        const [result] = await pool.execute(`
            SELECT u.user_id, u.username, a.score 
            FROM users u
            JOIN attendance_to a ON u.user_id = a.user_id
            WHERE a.room_id = ? 
            ORDER BY a.score DESC`, [room_id]); // เรียงคะแนนจากมากไปน้อย

        if (result.length === 0) {
            return res.status(404).json({ message: "No users found in this room" });
        }

        res.status(200).json({ users: result });

    } catch (error) {
        console.error("Error fetching room scores:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.updateRoom = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
      // ตรวจสอบ JWT และดึง userId กับ Room_id
      const decoded = await verifyToken(token);
      const userId = decoded.userId;
      const roomId = decoded.Room_id;

      if (!userId || !roomId) {
          return res.status(400).json({ message: "Invalid token: Missing user ID or Room ID" });
      }

      // ตรวจสอบว่า user เป็นเจ้าของห้องหรือไม่
      const [room] = await pool.query(
          "SELECT * FROM room_list WHERE Room_id = ? AND owner = ?",
          [roomId, userId]
      );

      if (room.length === 0) {
          return res.status(403).json({ message: "You are not authorized to update this room or room does not exist" });
      }

      // ดึงข้อมูลจาก request body
      const { Room_name, Room_description, Room_password,  duration } = req.body;

      // อัปเดตค่าต่าง ๆ ที่อนุญาตให้แก้ไขได้
      await pool.query(
          `UPDATE room_list SET 
              Room_name = COALESCE(?, Room_name),
              Room_description = COALESCE(?, Room_description),
              Room_password = COALESCE(?, Room_password),
              duration = COALESCE(?, duration)
           WHERE Room_id = ?`,
          [Room_name, Room_description, Room_password,  duration, roomId]
      );

      res.status(200).json({ message: "Room updated successfully" });
  } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Error updating room", error: error.message });
  }
};
