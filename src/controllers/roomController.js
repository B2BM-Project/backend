const pool = require('../config/database');

// ฟังก์ชันสำหรับสร้างห้อง
exports.createRoom = async (req, res) => {
    const { Room_name, Room_description, Room_password, status, duration } = req.body;

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!Room_name || typeof Room_name !== 'string') {
        return res.status(400).json({ message: 'Room_name is required and must be a string' });
    }

    try {
        // ใช้ destructuring เพื่อแยก rows จากการ execute คำสั่ง SQL
        const result = await pool.query(
            'INSERT INTO room_list (Room_name, Room_description, Room_password, status, duration) VALUES (?, ?, ?, ?, ?)',
            [
                Room_name,
                Room_description || null,
                Room_password || null,
                status != null ? status : 0, // ตรวจสอบว่ามีค่า status หรือไม่
                duration != null ? duration : 1 // ตรวจสอบว่ามีค่า duration หรือไม่
            ]
        );

        // ส่งผลลัพธ์การสร้างห้องกลับไป
        res.status(201).json({
            message: 'Room created successfully',
            roomName: Room_name, // name ของห้องที่สร้าง
        });
    } catch (error) {
        console.error('Error creating room:', error);
        if (error.code === 'ECONNRESET') {
            console.error('Connection reset. Retrying...');
        }
        // ตรวจสอบข้อผิดพลาดสำหรับการ debug
        const errorMessage = error.code === 'ER_BAD_NULL_ERROR' ? 'Invalid input data' : error.message;

        res.status(500).json({
            message: 'Error creating room',
            error: errorMessage
        });
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลห้องตาม ID
exports.getRoomById = async (req, res) => {
    const { id } = req.params;  // ดึง id จาก URL parameter

    try {
        // เพิ่มเงื่อนไขในการ query เพื่อดึงข้อมูลห้องตาม id
        const [rows] = await pool.query(
            'SELECT * FROM room_list WHERE Room_id = ?',
            [id]  // ส่งค่า id ไปใน query
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Room not found',
            });
        }

        // ส่งข้อมูลห้องกลับไปที่ client
        res.status(200).json({
            message: 'Room fetched successfully',
            data: rows[0],  // ส่งข้อมูลห้องแรกที่พบ
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({
            message: 'Error fetching room',
            error: error.message,
        });
    }
};

