const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');

// Secret key สำหรับ JWT
const secretKey = process.env.JWT_SECRET || 'mysecretkey'; // หากไม่มีใน .env จะใช้ค่าดีฟอลต์

// ตัวแปรสำหรับเก็บ blacklist ของ token (สามารถใช้ Redis หรือฐานข้อมูลได้)
let tokenBlacklist = [];

// ระบบ signup //
const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    try {
        connection.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, results) => {
            if (err) {
                console.error("Error querying the database", err);
                return res.status(500).json({ message: 'Error processing request.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Username or email already exists.' });
            }

            if (password === username) {
                return res.status(400).json({ message: 'Password cannot be the same as username.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            connection.query(
                "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                [username, hashedPassword, email],
                (err, results) => {
                    if (err) {
                        console.error("Error while inserting into users table:", err);
                        return res.status(500).json({ message: 'Error creating user.' });
                    }

                    return res.status(201).json({ message: 'User created successfully.' });
                }
            );
        });
    } catch (error) {
        console.error("Error hashing password", error);
        return res.status(500).json({ message: 'Error processing request.' });
    }
};

// ระบบ login //
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        connection.query(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, results) => {
                if (err) {
                    console.error("Error querying the database", err);
                    return res.status(500).json({ message: 'Error processing request.' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }

                const user = results[0];
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }

                // สร้าง JWT
                const token = jwt.sign(
                    { userId: user.id, username: user.username },
                    secretKey,
                    { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
                );

                return res.status(200).json({
                    message: 'Login successful',
                    token, // ส่ง token กลับไปให้ client
                });
            }
        );
    } catch (error) {
        console.error("Error comparing password", error);
        return res.status(500).json({ message: 'Error processing request.' });
    }
};

// ระบบ logout //
const logoutUser = (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(400).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ message: 'Token missing' });
    }

    // เพิ่ม token เข้า blacklist
    tokenBlacklist.push(token);

    // ส่งข้อความยืนยันการ logout
    return res.status(200).json({ message: 'Logout successful, token invalidated.' });
};

// ฟังก์ชันตรวจสอบ JWT //
const verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    // ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
    if (tokenBlacklist.includes(token)) {
        return res.status(403).json({ message: 'Token is invalid (logged out)' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        return res.status(200).json({ message: 'Token is valid', payload: decoded });
    });
};

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    verifyToken,
};
