const express = require('express');
const cors = require('cors'); // นำเข้า CORS
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); // นำเข้าเส้นทางการใช้งานผู้ใช้
require('dotenv').config(); // โหลดไฟล์ .env

const app = express();
const port = 5100;

// เปิดใช้งาน CORS สำหรับทุกคำขอ (สามารถจำกัดได้ตามต้องการ)
app.use(cors());

// Middleware สำหรับการจัดการข้อมูล JSON
app.use(express.json());
app.use(bodyParser.json());

// Middleware สำหรับจัดการข้อผิดพลาดจาก JSON ที่ไม่ถูกต้อง
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) { // ตรวจสอบข้อผิดพลาดจาก JSON
        return res.status(400).json({ message: 'Invalid JSON format' });
    }
    next();
});

// ใช้เส้นทาง API ของผู้ใช้
app.use('/', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
