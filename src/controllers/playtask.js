const db = require('../config/database'); // เรียกใช้การเชื่อมต่อฐานข้อมูลจาก db.js
const { verifyToken } = require('./jwtHelper'); 



// API สำหรับส่ง Flag
exports.submitFlag = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // ดึง JWT จาก Header
    const { Task_id, flag } = req.body; // ดึง Task_id และ flag จาก body request

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    if (!Task_id || !flag) {
        return res.status(400).json({ message: 'Task_id and flag are required' });
    }

    try {
        // ตรวจสอบ JWT และดึงข้อมูล user_id, Room_id
        const decoded = await verifyToken(token);
        const userId = decoded.userId;
        const roomId = decoded.Room_id;

        if (!userId || !roomId) {
            return res.status(400).json({ message: 'Invalid token data' });
        }

        // ตรวจสอบ flag ในฐานข้อมูลและ Task_id
        const [task] = await db.execute(
            'SELECT Task_id, score FROM task WHERE Task_id = ? AND flag = ? AND Room_id = ?',
            [Task_id, flag, roomId]
        );

        if (task.length === 0) {
            return res.status(400).json({ message: 'Invalid flag or task not found' });
        }

        const { score: scoreToAdd } = task[0];

        // อัปเดตคะแนนในตาราง attendance_to
        const [result] = await db.execute(
            'UPDATE attendance_to SET Score = Score + ? WHERE User_id = ? AND Room_id = ?',
            [scoreToAdd, userId, roomId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User or Room not found in attendance_to' });
        }

        res.status(200).json({
            message: 'Flag is correct! Score updated successfully',
            Task_id: Task_id,
            scoreAdded: scoreToAdd,
        });
    } catch (err) {
        console.error('Error processing flag:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
