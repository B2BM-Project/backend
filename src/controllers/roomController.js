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
            'INSERT INTO ROOM_LIST (Room_name, Room_description, Room_password, status, duration) VALUES (?, ?, ?, ?, ?)',
            [
                Room_name,
                Room_description || null,
                Room_password || null,
                status != null ? status : 0, // ตรวจสอบว่ามีค่า status หรือไม่
                duration != null ? duration : 0 // ตรวจสอบว่ามีค่า duration หรือไม่
            ]
        );

        // ส่งผลลัพธ์การสร้างห้องกลับไป
        res.status(201).json({
            message: 'Room created successfully',
            roomName: Room_name, // name ของห้องที่สร้าง
        });
    } catch (error) {
        console.error('Error creating room:', error);

        // ตรวจสอบข้อผิดพลาดสำหรับการ debug
        const errorMessage = error.code === 'ER_BAD_NULL_ERROR' ? 'Invalid input data' : error.message;

        res.status(500).json({
            message: 'Error creating room',
            error: errorMessage
        });
    }
};
