const express = require('express');
const { createRoom } = require('../controllers/roomController');
const router = express.Router();

// สร้างห้องใหม่
router.post('/rooms', createRoom);

module.exports = router;
