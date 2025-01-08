const db = require('../config/database'); 

const getRanking = async (req, res) => {
    try {
        // Query เพื่อดึงข้อมูลผู้ใช้งานและเรียงตาม total_score (มากไปน้อย)
        const [rows] = await db.execute(
            `SELECT user_id, username, display_name, total_score
            FROM users
            ORDER BY total_score DESC`
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // ส่งผลลัพธ์กลับเป็น JSON
        res.status(200).json({
            message: 'User rankings fetched successfully',
            rankings: rows,
        });
    } catch (err) {
        console.error('Error fetching rankings:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = { getRanking };
