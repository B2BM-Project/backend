const jwt = require('jsonwebtoken');

// Secret key สำหรับ JWT
const secretKey = process.env.JWT_SECRET || 'mysecretkey'; // หากไม่มีใน .env จะใช้ค่าดีฟอลต์

// ตัวแปรสำหรับเก็บ blacklist ของ token (ใช้ Set เพื่อเพิ่มประสิทธิภาพ)
const tokenBlacklist = new Set();

// ฟังก์ชันสำหรับสร้าง JWT
const createToken = (payload, expiresIn = '6h') => {
    if (!payload.userId) {
        throw new Error('Payload must contain userId');
    }

    // ตรวจสอบว่ามี Room_id หรือไม่ ถ้าไม่มีให้เตือน
    if (!payload.Room_id) {
        console.warn('Payload does not contain Room_id. Consider including it if relevant.');
    }

    return jwt.sign(payload, secretKey, { expiresIn });
};

// ฟังก์ชันตรวจสอบ JWT
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        if (tokenBlacklist.has(token)) {
            return reject(new Error('Token is invalid (logged out)'));
        }
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
};

// ฟังก์ชันเพิ่ม token เข้า blacklist
const invalidateToken = (token) => {
    if (token) {
        tokenBlacklist.add(token);
    } else {
        console.warn('Attempted to invalidate an empty token.');
    }
};

// ฟังก์ชันตรวจสอบว่า token อยู่ใน blacklist หรือไม่
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

module.exports = {
    createToken,
    verifyToken,
    invalidateToken,
    isTokenBlacklisted,
};
