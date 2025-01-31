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

        // ✅ ดึง submit list ของ user ว่าเคยส่ง Task_id นี้ไปแล้วหรือยัง
        const [attendance] = await db.execute(
            'SELECT submit FROM attendance_to WHERE User_id = ? AND Room_id = ?',
            [userId, roomId]
        );

        let submittedTasks = attendance.length > 0 && attendance[0].submit ? attendance[0].submit.split(',') : [];

        // ✅ ตรวจสอบว่ามี Task_id นี้ใน submit list หรือยัง
        if (submittedTasks.includes(Task_id.toString())) {
            return res.status(400).json({ message: 'You have already submitted this flag!' });
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

        // ✅ เพิ่ม Task_id ลงไปใน submit list
        submittedTasks.push(Task_id.toString());
        const updatedSubmitList = submittedTasks.join(',');

        // ✅ อัปเดตคะแนนและ submit list ใน attendance_to
        const [result] = await db.execute(
            'UPDATE attendance_to SET Score = Score + ?, submit = ? WHERE User_id = ? AND Room_id = ?',
            [scoreToAdd, updatedSubmitList, userId, roomId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User or Room not found in attendance_to' });
        }

        res.status(200).json({
            message: 'Flag is correct! Score updated successfully',
            Task_id: Task_id,
            scoreAdded: scoreToAdd,
            updatedSubmitList
        });
    } catch (err) {
        console.error('Error processing flag:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
