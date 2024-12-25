const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('../config/database'); // เรียกใช้การเชื่อมต่อฐานข้อมูลจาก db.js

// Set up multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public"); // กำหนดโฟลเดอร์ในการเก็บไฟล์
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname.split('.')[0]; // ดึงชื่อไฟล์เดิม (ไม่รวม .นามสกุล)
        const extension = path.extname(file.originalname); // ดึงนามสกุลไฟล์
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ''); // '2024-11-30' date 
        const formattedTime = date.toTimeString().slice(0, 8).replace(/:/g, ''); // '00:34:08' time
        cb(null, `${originalName} ${formattedDate} ${formattedTime}${extension}`);
    }
});

// Initialize multer with storage options
const upload = multer({ storage });

// Controller for uploading files
const uploadFiles = (req, res, next) => {
    console.log('Request received:', req.body);  // Log the incoming request body

    if (!req.files || req.files.length === 0) {
        console.log('No files uploaded');
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => file.filename);
    const { Task_title, Task_description, flag, Room_id } = req.body;

    console.log('Uploading files:', uploadedFiles);

    if (!Task_title || !Task_description || !flag || !Room_id) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const filesString = uploadedFiles.join(',');

    const query = `INSERT INTO task (Task_title, Task_description, flag, Task_file, Room_id) VALUES (?, ?, ?, ?, ?)`;
    const values = [Task_title, Task_description, flag, filesString, Room_id];
    res.status(200).json({ upload: uploadedFiles, message: 'File uploaded and task saved successfully' });
    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).json({ error: 'Failed to save task to the database' });
        }

        console.log('File uploaded and task saved');
        
    });
};


// Controller for showing files in /public directory
const showPublicFiles = (req, res) => {
    const publicDir = path.join(__dirname, '..', 'public'); // ระบุ path ไปยัง public
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading public directory');
        }
        const fileList = files.map(file => `<li>${file}</li>`).join('');
        res.send(`
            <h1>Files in /public Directory:</h1>
            <ul>${fileList}</ul>
        `);
    });
};

module.exports = {
    upload,
    uploadFiles,
    showPublicFiles
};
