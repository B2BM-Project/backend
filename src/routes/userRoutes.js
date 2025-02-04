const express = require('express');
const router = express.Router();
const create_login = require('../controllers/create_login');
const { upload2} = require('../controllers/create_login');
const test = require('../controllers/test')
const propositionController = require('../controllers/proposition')
const detail = require('../controllers/detail')
const room = require('../controllers/roomController')
const play = require('../controllers/playtask')
const rank = require('../controllers/ranking')

const { upload, uploadFiles, showPublicFiles , updateTask, deleteTask , downloadFilesByTaskId} = require('../controllers/taskController');
const card = require('../controllers/card');
const authMiddleware = require('../middleware/authMiddleware');



//////------------------   start USER ----------------------------- ///////////

// เส้นทางสำหรับสร้างผู้ใช้ใหม่ /users/create
router.post('/signup', create_login.createUser);

// เส้นทางสำหรับ login ผู้ใช้ /users/login
router.post('/login', create_login.loginUser);

// เส้นทางสำหรับ logout ผู้ใช้ /users/logout
router.post('/logout', create_login.logoutUser);  


// เส้นทางสำหรับสร้าง room
router.post('/rooms', room.createRoom); // ต้องใส่รหัส flag ก่อนนำขึ้น db 

// เส้นทางสำหรับหา tasks ของห้องด้วย Room_id
router.get('/rooms/:id/tasks', room.getTasksByRoomId); // ต้องเพิ่ม เช็ค สิทธิ์ เเละ เพิ่ม roomid เข้าไปใน token สำหรับ api นี้

// Route สำหรับดึง Task ของ Room โดยใช้ Room_id และ Room_password join 
router.post('/rooms/tasks', room.getTasksByRoomIdAndPassword);

// update room
router.put('/rooms', room.updateRoom);

//show room
router.get('/rooms/showall', room.getAllRooms);

//show room
router.get('/rooms/showroomscore/:room_id', room.getRoomScores);

// delete room
router.delete('/room', room.deleteRoom);


// Route ส่ง flag
router.post('/submitflag', play.submitFlag); //ยังติดเรื่องต้องส่ง id ของ task ตอนส่ง เเละ เข้ารหัส ก่อนนำไปเช็ค flag

// create task 
router.post('/upload', upload.array('multiFile', 2), uploadFiles);
// update task
router.put('/update-task', upload.array('multiFile', 2), updateTask);
// delete task
router.delete('/delete-task', deleteTask);

router.get('/download/task/:task_id', downloadFilesByTaskId);


// Route for showing files in the public directory
router.get('/public', showPublicFiles);

router.get('/card', card.cardDetail);



//////------------------   end USER ----------------------------- ///////////


//---------------------------------------------------------------------------//


//////------------------   start ADMIN ----------------------------- ///////////


// เส้นทางสำหรับ ดึงuser ผ่าน token
router.get('/user/me', create_login.getUserByToken);

// เส้นทาง update user
router.put('/users', upload2.single('profile_img'), create_login.updateUser); // api upload img เเละ update user

// เส้นทางดึงรูป profile
router.get('/user/meimg', create_login.getUserProfileImg);// ดึงรูปจากคนที่ login อยู่

// เส้นทางหา user ด้วย id
router.get('/users/:id', create_login.getUserById);


// เส้นทางหา user ด้วย id
router.get('/ranking', rank.getRanking);

// เส้นทางสำหรับตรวจสอบ JWT /users/verify
router.get('/verify', create_login.verifyTokenHandler);  


// เส้นทางสำหรับ proposition ทั้งหมด 
router.get('/proposition', propositionController.getAllPropositions);
router.get('/proposition/:id', propositionController.getPropositionById);
router.post('/proposition', propositionController.createProposition);  
router.put('/proposition/:id', propositionController.updateProposition);
router.delete('/proposition/:id', propositionController.deleteProposition);
router.post('/proposition/checkflag', propositionController.checkFlag); // เหลือห้ามส่งซ้ำ


// เส้นทางของ detail บทเรียน
router.get('/detail/:id',  detail.getById);
router.get('/detail', detail.getAll);

// เส้นทางสำหรับ /users/test ที่เรียกใช้ฟังก์ชัน testApi
router.get('/test', test.testApi);

//////------------------   end ADMIN ----------------------------- ///////////


module.exports = router;
