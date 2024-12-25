const express = require('express');
const cors = require('cors');
const app = express();
const uploadRoutes = require('./route/Routes'); // นำเข้า route

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ให้บริการไฟล์ในโฟลเดอร์ public

// ใช้ routes ที่สร้างใหม่
app.use('/', uploadRoutes);

const port = 3002;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
