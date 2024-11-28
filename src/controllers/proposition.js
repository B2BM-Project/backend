const db = require('../config/database');

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

// เพิ่มข้อมูล
exports.createProposition = (req, res) => {
    const { Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File } = req.body;
    const query = 'INSERT INTO PROPOSITION (Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Proposition created successfully', id: results.insertId });
    });
};

// อัปเดตข้อมูล
exports.updateProposition = (req, res) => {
    const { id } = req.params;
    const { Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File } = req.body;
    const query = 'UPDATE PROPOSITION SET Proposition_name = ?, Proposition_detail = ?, Proposition_detail_img = ?, Type_id = ?, Level = ?, Catagory = ?, Flag = ?, Score = ?, File = ? WHERE Proposition_id = ?';
    db.query(query, [Proposition_name, Proposition_detail, Proposition_detail_img, Type_id, Level, Catagory, Flag, Score, File, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Proposition not found' });
        res.json({ message: 'Proposition updated successfully' });
    });
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
