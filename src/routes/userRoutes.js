const express = require('express');
const router = express.Router();
const create_login = require('../controllers/create_login');
const test = require('../controllers/test')
const propositionController = require('../controllers/proposition')
const detail = require('../controllers/detail')
const room = require('../controllers/roomController')
const play = require('../controllers/playtask')
const rank = require('../controllers/ranking')
const { upload, uploadFiles, showPublicFiles } = require('../controllers/taskController');


//////------------------   start USER ----------------------------- ///////////

// เส้นทางสำหรับสร้างผู้ใช้ใหม่ /users/create
router.post('/signup', create_login.createUser);

// เส้นทางสำหรับ login ผู้ใช้ /users/login
router.post('/login', create_login.loginUser);

// เส้นทางสำหรับ logout ผู้ใช้ /users/logout
router.post('/logout', create_login.logoutUser);  


// เส้นทางสำหรับสร้าง room
router.post('/rooms', room.createRoom); // ต้องใส่รหัส flag ก่อนนำขึ้น db 

// ยังไม่ได้สร้าง edit room ต้องเช็คสิทธิ์ก่อนถึงจะ edit ได้

// เส้นทางสำหรับหา tasks ของห้องด้วย Room_id
router.get('/rooms/:id/tasks', room.getTasksByRoomId); // ต้องเพิ่ม เช็ค สิทธิ์ เเละ เพิ่ม roomid เข้าไปใน token สำหรับ api นี้

// Route สำหรับดึง Task ของ Room โดยใช้ Room_name และ Room_password
router.post('/rooms/tasks', room.getTasksByRoomNameAndPassword);

// Route ส่ง flag
router.post('/submitflag', play.submitFlag); //ยังติดเรื่องต้องส่ง id ของ task ตอนส่ง เเละ เข้ารหัส ก่อนนำไปเช็ค flag

router.post('/upload', upload.array('multiFile', 2), uploadFiles);

// Route for showing files in the public directory
router.get('/public', showPublicFiles);

//////------------------   end USER ----------------------------- ///////////


//---------------------------------------------------------------------------//


//////------------------   start ADMIN ----------------------------- ///////////


// เส้นทางสำหรับ ดึงuser ผ่าน token
router.get('/user/me', create_login.getUserByToken);

// เส้นทางหา user ด้วย id
router.get('/users/:id', create_login.getUserById);

// เส้นทางหา user ด้วย id
router.get('/ranking', rank.getRanking);

// เส้นทางสำหรับตรวจสอบ JWT /users/verify
router.get('/verify', create_login.verifyTokenHandler);  


// เส้นทางสำหรับ proposition ทั้งหมด 
router.get('/proposition', propositionController.getAllPropositions);
router.get('/proposition/:id', propositionController.getPropositionById);
router.post('/proposition', propositionController.createProposition);  //  สร้างได้ เเต่เขียนไม่ดีเลยทำงานช้า
router.put('/proposition/:id', propositionController.updateProposition);
router.delete('/proposition/:id', propositionController.deleteProposition);
router.post('/proposition/checkflag', propositionController.checkFlag); //ต้องเเก้ให้ดึง user_id จาก token เเล้วเอามาใช้ เเละ ตอนส่งตอนนี้ยังต้องส่ง id ตามมาด้วย // ล่าสุด ส่ง flag ไม่ได้


// เส้นทางของ detail บทเรียน
router.get('/detail/:id',  detail.getById);
router.get('/detail', detail.getAll);

// เส้นทางสำหรับ /users/test ที่เรียกใช้ฟังก์ชัน testApi
router.get('/test', test.testApi);

//////------------------   end ADMIN ----------------------------- ///////////


module.exports = router;
