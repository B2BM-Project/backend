const bcrypt = require('bcrypt');
const { createToken, verifyToken, invalidateToken } = require('./jwtHelper');
const pool = require('../config/database'); // ใช้ pool แทน connection
const multer = require('multer');
const path = require('path');

// ฟังก์ชันตรวจสอบรูปแบบอีเมล
const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

// ระบบ signup
const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const [existingUsers] = await pool.query(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        if (password === username) {
            return res.status(400).json({ message: 'Password cannot be the same as username.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (username, password, email, total_score) VALUES (?, ?, ?,?)",
            [username, hashedPassword, email,0]
        );

        return res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ message: 'Error processing request.' });
    }
};

// ระบบ login
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const [users] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // ตรวจสอบว่า user.user_id (หรือ user.id ถ้าคอลัมน์เป็น id) มีค่า
        if (!user.user_id) { // เปลี่ยนจาก user.id เป็น user.user_id ถ้าชื่อคอลัมน์เป็น user_id
            return res.status(400).json({ message: 'User ID is missing.' });
        }

        // ส่ง user_id ไปใน payload ของ JWT
        const token = createToken({ userId: user.user_id, username: user.username }); 
        
        return res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: 'Error processing request.', error: err.message });
    }
};


// ระบบ logout
const logoutUser = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ message: 'Token missing' });
    }

    invalidateToken(token);
    return res.status(200).json({ message: 'Logout successful, token invalidated.' });
};

// ฟังก์ชันตรวจสอบ JWT
const verifyTokenHandler = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = await verifyToken(token);
        return res.status(200).json({ message: 'Token is valid', payload: decoded });
    } catch (err) {
        return res.status(403).json({ message: `Token validation failed: ${err.message}` });
    }
};

// ดึงข้อมูลผู้ใช้
const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const [users] = await pool.query(
            "SELECT user_id, username, email, display_name, profile_img, role, total_score, certificate_name, member_since FROM users WHERE user_id = ?",
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user: users[0] });
    } catch (err) {
        console.error("Error retrieving user:", err);
        return res.status(500).json({ message: 'Error processing request.' });
    }
};
// ดึงข้อมูลผู้ใช้ด้วย JWT
const getUserByToken = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = await verifyToken(token);

        // ตรวจสอบว่ามี userId ใน payload ของ JWT
        if (!decoded.userId) {
            return res.status(400).json({ message: 'User ID is missing in token.' });
        }

        const [users] = await pool.query(
            "SELECT user_id, username, email, display_name, profile_img, role, total_score, certificate_name, member_since FROM users WHERE user_id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user: users[0] });
    } catch (err) {
        console.error("Error retrieving user by token:", err);
        return res.status(500).json({ message: 'Error processing request.', error: err.message });
    }
};



// ตั้งค่า multer ด้วย memoryStorage เพื่อเก็บไฟล์ใน buffer
const upload2 = multer({ storage: multer.memoryStorage() }); 

// updateUser ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
const updateUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // ดึง JWT จาก Header
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        const decoded = await verifyToken(token);  // ตรวจสอบ JWT
        const userId = decoded.userId;
        const { display_name, password, certificate_name } = req.body;
        const profile_img = req.file; // ได้รับไฟล์จากการอัปโหลด

        // สร้าง array เก็บค่าที่จะอัปเดต
        let fieldsToUpdate = [];
        let values = [];

        if (display_name !== undefined) {
            fieldsToUpdate.push("display_name = ?");
            values.push(display_name);
        }

        if (profile_img !== undefined) {
            // อ่านไฟล์และแปลงเป็น Buffer
            const fileBuffer = profile_img.buffer; // ได้บัฟเฟอร์ของไฟล์ที่อัปโหลด

            fieldsToUpdate.push("profile_img = ?");
            values.push(fileBuffer); // เก็บบัฟเฟอร์ของไฟล์ลงในฐานข้อมูล
        }

        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fieldsToUpdate.push("password = ?");
            values.push(hashedPassword);
        }

        if (certificate_name !== undefined) {
            fieldsToUpdate.push("certificate_name = ?");
            values.push(certificate_name);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        values.push(userId);  // ใส่ userId ที่จะอัปเดตในฐานข้อมูล
        const query = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE user_id = ?`;

        await pool.query(query, values);  // ทำการ query ไปยังฐานข้อมูล

        return res.status(200).json({ message: "User updated successfully." });
    } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Error processing request." });
    }
};



const getUserProfileImg = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // ดึง JWT จาก Header
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }
    const decoded = await verifyToken(token);  // ตรวจสอบ JWT
    const userId = decoded.userId;
    
    try {
        const query = 'SELECT profile_img FROM users WHERE user_id = ?';
        const [result] = await pool.query(query, [userId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profileImg = result[0].profile_img;

        if (!profileImg) {
            return res.status(404).json({ message: 'Profile image not found' });
        }

        // ตรวจสอบประเภทของไฟล์ (ในที่นี้สมมุติเป็น image/png)
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename=profile-image.png');
        res.send(profileImg); // ส่งไฟล์ออกไป

    } catch (err) {
        console.error("Error retrieving profile image:", err);
        return res.status(500).json({ message: "Error processing request." });
    }
};


// เพิ่มฟังก์ชัน getUserProfileImg ใน exports
module.exports = {
    createUser,
    loginUser,
    logoutUser,
    verifyTokenHandler,
    getUserById,
    getUserByToken,
    updateUser,
    upload2,
    getUserProfileImg
};
