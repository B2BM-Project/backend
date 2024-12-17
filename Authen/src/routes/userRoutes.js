const express = require('express');
const { createUser, loginUser, logoutUser, verifyToken } = require('../controllers/create_login');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', authenticateToken, logoutUser);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
