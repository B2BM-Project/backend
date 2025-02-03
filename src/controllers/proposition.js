const db = require('../config/database');
const bcrypt = require('bcrypt');
const { verifyToken } = require('./jwtHelper');
// ดึงข้อมูลทั้งหมด
exports.getAllPropositions = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM proposition'); // ใช้ await แทน callback
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ดึงข้อมูลเฉพาะ ID
exports.getPropositionById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM proposition WHERE Proposition_id = ?';
        
        const [results] = await db.query(query, [id]); // ใช้ await แทน callback
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Proposition not found' });
        }
        
        res.json(results[0]); // ส่งคืนข้อมูลรายการแรก
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// เพิ่มข้อมูล (เข้ารหัส flag)
exports.createProposition = async (req, res) => {
    const { Proposition_name, Proposition_detail, Proposition_img, Type, Level, Catagory, Flag, Score, File } = req.body;

    try {
        // ตรวจสอบว่า Type มีค่าเป็น "challenge" หรือ "learn" เท่านั้น
        if (Type !== "challenge" && Type !== "learn") {
            return res.status(400).json({ error: "Invalid Type. Allowed values are 'challenge' or 'learn'." });
        }

        const hashedFlag = await bcrypt.hash(Flag, 10); // เข้ารหัส flag

        const query = `INSERT INTO proposition 
            (Proposition_name, Proposition_detail, Proposition_img, Type, Level, Catagory, Flag, Score, File) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [Proposition_name, Proposition_detail, Proposition_img, Type, Level, Catagory, hashedFlag, Score, File];

        const [results] = await db.query(query, values); // ✅ ใช้ await db.query()

        res.status(201).json({ message: 'Proposition created successfully', id: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// อัปเดตข้อมูล (เข้ารหัส flag ถ้ามี)
exports.updateProposition = async (req, res) => {
    const { id } = req.params;
    const { Proposition_name, Proposition_detail, Proposition_img, Type, Level, Catagory, Flag, Score, File } = req.body;

    try {
        // ตรวจสอบว่า Type ต้องเป็น "challenge" หรือ "learn" เท่านั้น
        if (Type && Type !== "challenge" && Type !== "learn") {
            return res.status(400).json({ message: "Invalid Type. Allowed values: 'challenge' or 'learn'" });
        }

        // เข้ารหัส Flag ถ้ามีการส่งค่า
        let hashedFlag = Flag ? await bcrypt.hash(Flag, 10) : null;

        // คำสั่ง SQL และค่าที่จะอัปเดต
        const query = `
            UPDATE proposition 
            SET 
                Proposition_name = ?, 
                Proposition_detail = ?, 
                Proposition_img = ?, 
                Type = ?, 
                Level = ?, 
                Catagory = ?, 
                Flag = ?, 
                Score = ?, 
                File = ? 
            WHERE Proposition_id = ?
        `;

        const values = [
            Proposition_name, 
            Proposition_detail, 
            Proposition_img, 
            Type, 
            Level, 
            Catagory, 
            hashedFlag || Flag, 
            Score, 
            File, 
            id
        ];

        // ใช้ await ในการรัน query
        const [results] = await db.query(query, values);

        // ตรวจสอบว่าอัปเดตสำเร็จหรือไม่
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Proposition not found" });
        }

        res.json({ message: "Proposition updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ลบข้อมูล
exports.deleteProposition = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM proposition WHERE Proposition_id = ?';
        
        // ใช้ await ในการรัน query
        const [results] = await db.query(query, [id]);

        // ตรวจสอบว่า Proposition_id มีอยู่ในฐานข้อมูลหรือไม่
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Proposition not found" });
        }

        res.json({ message: "Proposition deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




// Check Flag
// Check Flag
exports.checkFlag = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // ดึง JWT จาก Header
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }
    
    const { id, flag } = req.body; // รับ Proposition_id และ flag จาก request
    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    try {
        // ดึงค่า Flag และ Score จากฐานข้อมูล
        const query = 'SELECT Flag, Score FROM proposition WHERE Proposition_id = ?';
        const [results] = await db.query(query, [id]); 

        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (results.length === 0) {
            return res.status(404).json({ message: "Proposition not found" });
        }

        const storedFlag = results[0].Flag;
        const score = results[0].Score; // คะแนนของโจทย์

        // ใช้ bcrypt ในการเปรียบเทียบ flag
        const isMatch = await bcrypt.compare(flag, storedFlag);
        if (!isMatch) {
            return res.status(401).json({ message: "Flag is incorrect" });
        }

        // ดึง total_score ปัจจุบันของผู้ใช้
        const userQuery = 'SELECT total_score FROM users WHERE user_id = ?';
        const [userResults] = await db.query(userQuery, [userId]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const newTotalScore = userResults[0].total_score + score;

        // อัปเดต total_score ของ user
        const updateQuery = 'UPDATE users SET total_score = ? WHERE user_id = ?';
        await db.query(updateQuery, [newTotalScore, userId]);

        return res.json({
            message: "Flag is correct",
            newTotalScore: newTotalScore
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

