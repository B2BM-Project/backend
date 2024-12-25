const path = require('path');
const multer = require('multer');
const fs = require('fs');

// function determine path to save file
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

const upload = multer({ storage });

// Controller for uploading files
const uploadFiles = (req, res, next) => {
    const uploadedFiles = req.files.map((file) => file.filename);
    res.json({ upload: uploadedFiles });
    console.log('file uploaded');
    console.log(req.body);
    console.log(req.file);

    
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