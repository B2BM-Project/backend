const express = require('express');
const router = express.Router();
const create_login = require('../controllers/create_login');
const test = require('../controllers/test')
const propositionController = require('../controllers/proposition')
const detail = require('../controllers/detail')
const room = require('../controllers/roomController')
const { upload, uploadFiles, showPublicFiles } = require('../controllers/taskController');


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


router.get('/proposition', propositionController.getAllPropositions);
router.get('/proposition/:id', propositionController.getPropositionById);
router.post('/proposition', propositionController.createProposition);
router.put('/proposition/:id', propositionController.updateProposition);
router.delete('/proposition/:id', propositionController.deleteProposition);
router.post('/proposition/:id/checkflag', propositionController.checkFlag);

// เส้นทางสำหรับตรวจสอบ JWT /users/verify
router.get('/detail/:id',  detail.getById);
router.get('/detail', detail.getAll);


router.post('/rooms', room.createRoom);

router.post('/upload', upload.array('multiFile', 2), uploadFiles);

// Route for showing files in the public directory
router.get('/public', showPublicFiles);

module.exports = router;
