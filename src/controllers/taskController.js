const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('../config/database'); // เรียกใช้การเชื่อมต่อฐานข้อมูลจาก db.js
const { verifyToken } = require('./jwtHelper');// ใช้ verifyToken สำหรับถอดรหัส JWT
const archiver = require('archiver'); 

// Set up multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public"); // กำหนดโฟลเดอร์ในการเก็บไฟล์
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname.split('.')[0]; // ดึงชื่อไฟล์เดิม (ไม่รวม .นามสกุล)
        const extension = path.extname(file.originalname); // ดึงนามสกุลไฟล์
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ''); // '2024-11-30'
        const formattedTime = date.toTimeString().slice(0, 8).replace(/:/g, ''); // '003408'
        cb(null, `${originalName} ${formattedDate} ${formattedTime}${extension}`);
    }
});

// Initialize multer with storage options
const upload = multer({ storage });

// Controller for uploading files
const uploadFiles = async (req, res, next) => {
    console.log('Request received:', req.body);  // Log the incoming request body

    // ตรวจสอบ Authorization header และดึง token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('Authorization token missing');
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        // ถอดรหัส JWT เพื่อดึง Room_id
        const decoded = await verifyToken(token);
        const Room_id = decoded.Room_id; // ดึง Room_id จาก token
        console.log('Decoded JWT:', decoded);

        if (!Room_id) {
            return res.status(400).json({ error: 'Room_id is missing in token' });
        }

        if (!req.files || req.files.length === 0) {
            console.log('No files uploaded');
            // return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => file.filename);
        const { Task_title, Task_description, flag, url, score } = req.body;

        console.log('Uploading files:', uploadedFiles);

        if (!Task_title || !Task_description || !flag || !score) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const filesString = uploadedFiles.join(',');

        const query = `INSERT INTO task (Task_title, Task_description, flag, Task_file,url, score, Room_id) VALUES (?, ?, ?,?, ?, ?, ?)`;
        const values = [Task_title, Task_description, flag, filesString , url || null, score, Room_id];

        try {
            const [results] = await db.execute(query, values);
            console.log('File uploaded and task saved');
            res.status(200).json({
                upload: uploadedFiles,
                message: 'File uploaded and task saved successfully'
            });
        } catch (err) {
            console.error('Error inserting task:', err);
            res.status(500).json({ error: 'Failed to save task to the database' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ error: 'Failed to verify token', details: error.message });
    }
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

const updateTask = async (req, res) => {
    console.log('Request received for updating task:', req.body);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('Authorization token missing');
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        const decoded = await verifyToken(token);
        const Room_id = decoded.Room_id;
        console.log('Decoded JWT:', decoded);

        if (!Room_id) {
            return res.status(400).json({ error: 'Room_id is missing in token' });
        }

        const { Task_id, Task_title, Task_description, flag, score } = req.body;

        if (!Task_id ) {
            console.log('Missing required fields for updating task');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            uploadedFiles = req.files.map(file => file.filename);
        }

        let filesString = uploadedFiles.join(',');

        if (uploadedFiles.length === 0) {
            // ถ้าไม่มีไฟล์ที่อัปโหลดใหม่ ให้ใช้ค่าเดิมจากฐานข้อมูล
            const [existingTask] = await db.execute(`SELECT Task_file FROM task WHERE Task_id = ? AND Room_id = ?`, [Task_id, Room_id]);

            if (existingTask.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            filesString = existingTask[0].Task_file;
        } else {
            // หากมีไฟล์อัปโหลดใหม่ ให้ลบไฟล์เก่า
            const [oldTask] = await db.execute(`SELECT Task_file FROM task WHERE Task_id = ? AND Room_id = ?`, [Task_id, Room_id]);
            if (oldTask.length > 0 && oldTask[0].Task_file) {
                const oldFiles = oldTask[0].Task_file.split(',');
                oldFiles.forEach(file => {
                    const filePath = path.join(__dirname, '..', 'public', file);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted old file: ${filePath}`);
                    }
                });
            }
        }

        const query = `UPDATE task SET Task_title = ?, Task_description = ?, flag = ?, score = ?, Task_file = ? WHERE Task_id = ? AND Room_id = ?`;
        const values = [Task_title, Task_description, flag, score, filesString, Task_id, Room_id];

        try {
            const [results] = await db.execute(query, values);

            if (results.affectedRows === 0) {
                console.log('Task not found or not updated');
                return res.status(404).json({ error: 'Task not found or update failed' });
            }

            console.log('Task updated successfully');
            res.status(200).json({ 
                message: 'Task updated successfully',
                updatedFiles: uploadedFiles
            });
        } catch (err) {
            console.error('Error updating task:', err);
            res.status(500).json({ error: 'Failed to update task in the database' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ error: 'Failed to verify token', details: error.message });
    }
};

const deleteTask = async (req, res) => {
    console.log('Request received for deleting task:', req.body);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('Authorization token missing');
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        // ถอดรหัส JWT เพื่อยืนยันสิทธิ์ผู้ใช้งาน
        const decoded = await verifyToken(token);
        const Room_id = decoded.Room_id;
        console.log('Decoded JWT:', decoded);

        if (!Room_id) {
            return res.status(400).json({ error: 'Room_id is missing in token' });
        }

        const { Task_id } = req.body;

        if (!Task_id) {
            console.log('Missing Task_id for deletion');
            return res.status(400).json({ error: 'Task_id is required' });
        }

        // ดึงข้อมูล Task เพื่อเช็คว่าไฟล์เก่ามีอะไรบ้าง
        const [taskData] = await db.execute(`SELECT Task_file FROM task WHERE Task_id = ? AND Room_id = ?`, [Task_id, Room_id]);

        if (taskData.length === 0) {
            console.log('Task not found or unauthorized');
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        // ลบไฟล์ออกจากระบบ (ถ้ามี)
        if (taskData[0].Task_file) {
            const files = taskData[0].Task_file.split(','); // แยกชื่อไฟล์ (กรณีมีหลายไฟล์)
            files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'public', file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${file}`);
                }
            });
        }

        // ลบ Task ออกจากฐานข้อมูล
        const query = `DELETE FROM task WHERE Task_id = ? AND Room_id = ?`;
        const [results] = await db.execute(query, [Task_id, Room_id]);

        if (results.affectedRows === 0) {
            console.log('Task not found or deletion failed');
            return res.status(404).json({ error: 'Task not found or deletion failed' });
        }

        console.log('Task deleted successfully');
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
};


const downloadFilesByTaskId = async (req, res) => {
    const { task_id } = req.params;  // รับ task_id จาก URL params

    try {
        // สืบค้นชื่อไฟล์จากฐานข้อมูล
        const query = `SELECT Task_file FROM task WHERE Task_id = ?`;
        const [rows] = await db.execute(query, [task_id]);

        // หากไม่พบ task_id
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // แยกชื่อไฟล์ที่เกี่ยวข้องจากฟิลด์ Task_file
        const fileNames = rows[0].Task_file ? rows[0].Task_file.split(',') : [];

        // ถ้าไม่มีไฟล์ให้ดาวน์โหลด
        if (fileNames.length === 0) {
            return res.status(404).json({ error: 'No files found for this task' });
        }

        // กำหนดเส้นทางไฟล์ public
        const publicPath = path.join(__dirname, '..', '../public');
        const zipFileName = `task_${task_id}.zip`;  // ชื่อไฟล์ ZIP
        const zipFilePath = path.join(publicPath, zipFileName);

        // ลบไฟล์ ZIP เก่าถ้ามี
        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }

        // สร้าง Stream สำหรับไฟล์ ZIP
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // ส่งไฟล์ ZIP เมื่อการบีบอัดเสร็จสิ้น
        output.on('close', () => {
            res.download(zipFilePath, zipFileName, (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                    return res.status(500).json({ error: 'Failed to download zip file' });
                }
                // ลบไฟล์ ZIP หลังจากส่งเสร็จ
                fs.unlinkSync(zipFilePath);
            });
        });

        // ตรวจจับข้อผิดพลาดในการสร้าง ZIP
        archive.on('error', (err) => {
            console.error('Archiver Error:', err);
            return res.status(500).json({ error: 'Failed to create ZIP file', details: err.message });
        });

        archive.pipe(output);

        // เพิ่มไฟล์จาก Task_file ที่ได้รับจากฐานข้อมูล
        fileNames.forEach((file) => {
            const filePath = path.join(publicPath, file);
            if (fs.existsSync(filePath)) {
                console.log(`Adding file: ${filePath}`); // ตรวจสอบว่าไฟล์ถูกเพิ่มหรือไม่
                archive.file(filePath, { name: file });
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        });

        // สร้าง ZIP
        archive.finalize();
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database query failed', details: err.message });
    }
};





module.exports = {
    upload,
    uploadFiles,
    showPublicFiles,
    updateTask, // Export the updateTask function
    deleteTask,
    downloadFilesByTaskId
};


