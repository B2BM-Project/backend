const express = require('express');
const router = express.Router();
const create_login = require('../controllers/create_login');
const test = require('../controllers/test')

// เส้นทางสำหรับสร้างผู้ใช้ใหม่ /users/create
router.post('/create', create_login.createUser);

// เส้นทางสำหรับ login ผู้ใช้ /users/login
router.post('/login', create_login.loginUser);

// เส้นทางสำหรับตรวจสอบ JWT /users/verify
router.get('/verify', create_login.verifyToken);

// เส้นทางสำหรับ logout ผู้ใช้ /users/logout
router.post('/logout', create_login.logoutUser);  // เพิ่มเส้นทางนี้

// เส้นทางสำหรับ /users/test ที่เรียกใช้ฟังก์ชัน testApi
router.get('/test', test.testApi);

module.exports = router;
