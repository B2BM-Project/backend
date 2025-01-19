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
      "SELECT Task_id, Task_title, Task_description, Task_file, score, Room_id FROM task WHERE Room_id = ?",
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
exports.getTasksByRoomNameAndPassword = async (req, res) => {
  const { Room_name, Room_password } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!Room_name || !Room_password) {
    return res
      .status(400)
      .json({ message: "Room_name and Room_password are required" });
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

    // ตรวจสอบ Room_name และ Room_password
    const [room] = await pool.query(
      "SELECT * FROM room_list WHERE Room_name = ? AND Room_password = ?",
      [Room_name, Room_password]
    );

    if (room.length === 0) {
      return res
        .status(404)
        .json({ message: "Room not found or invalid credentials" });
    }

    const roomId = room[0].Room_id;

    // ตรวจสอบว่า user มีอยู่ใน attendance_to หรือไม่
    const [attendance] = await pool.query(
      "SELECT * FROM attendance_to WHERE Room_id = ? AND User_id = ?",
      [roomId, userId]
    );

    // ถ้าไม่มี user ใน attendance_to ให้เพิ่มเข้าไป
    if (attendance.length === 0) {
      await pool.query(
        "INSERT INTO attendance_to (Room_id, User_id, Score ) VALUES (?, ?, ?)",
        [roomId, userId, 0]
      );
    }

    // สร้าง roomToken ใหม่ที่มี roomId ที่อัปเดต
    const roomToken = createToken({ userId, Room_id: roomId });

    // ดึง tasks ที่เกี่ยวข้องกับ Room_id
    const [tasks] = await pool.query("SELECT * FROM task WHERE Room_id = ?", [
      roomId,
    ]);

    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
      roomToken, // ส่ง roomToken ใหม่ที่อัปเดต
    });
  } catch (error) {
    console.error(
      "Error fetching tasks by Room_name and Room_password:",
      error
    );
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