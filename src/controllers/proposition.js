const db = require('../config/database');
const bcrypt = require('bcrypt');

// ดึงข้อมูลทั้งหมด
exports.getAllPropositions = (req, res) => {
    const query = 'SELECT * FROM PROPOSITION';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// ดึงข้อมูลเฉพาะ ID
exports.getPropositionById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM PROPOSITION WHERE Proposition_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Proposition not found' });
        res.json(results[0]);
    });
};

// เพิ่มข้อมูล (เข้ารหัส flag)
exports.createProposition = async (req, res) => {
    const { Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File } = req.body;

    try {
        const hashedFlag = await bcrypt.hash(Flag, 10); // เข้ารหัส flag
        const query = 'INSERT INTO PROPOSITION (Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, hashedFlag, Score, File], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Proposition created successfully', id: results.insertId });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// อัปเดตข้อมูล (เข้ารหัส flag ถ้ามี)
exports.updateProposition = async (req, res) => {
    const { id } = req.params;
    const { Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File } = req.body;

    try {
        let hashedFlag = null;
        if (Flag) {
            hashedFlag = await bcrypt.hash(Flag, 10); // เข้ารหัส flag ถ้ามี
        }
        const query = 'UPDATE PROPOSITION SET Proposition_name = ?, Proposition_detail = ?, Proposition_detail_img = ?, Type_id = ?, Level = ?, Catagory = ?, Flag = ?, Score = ?, File = ? WHERE Proposition_id = ?';
        db.query(query, [Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, hashedFlag || Flag, Score, File, id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) return res.status(404).json({ message: 'Proposition not found' });
            res.json({ message: 'Proposition updated successfully' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ลบข้อมูล
exports.deleteProposition = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM PROPOSITION WHERE Proposition_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Proposition not found' });
        res.json({ message: 'Proposition deleted successfully' });
    });
};



// Check Flag
// Check Flag
exports.checkFlag = async (req, res) => {
    const { id, flag } = req.body; // รับ Proposition_id และ flag จาก request

    // ตรวจสอบว่ามีการส่งข้อมูลครบถ้วนหรือไม่
   

    try {
        const query = 'SELECT Flag FROM PROPOSITION WHERE Proposition_id = ?';
        db.query(query, [id], async (err, results) => {
           

            const storedFlag = results[0].Flag;

            // ใช้ bcrypt ในการเปรียบเทียบ flag
            const isMatch = await bcrypt.compare(flag, storedFlag);
            if (isMatch) {
                return res.json({ message: 'Flag is correct' });
            } else {
                return res.status(401).json({ message: 'Flag is incorrect' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
