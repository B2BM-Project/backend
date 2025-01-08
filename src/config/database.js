const mysql = require('mysql2/promise');
require('dotenv').config(); // โหลดไฟล์ .env

// สร้างการเชื่อมต่อแบบ Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ทดสอบการเชื่อมต่อ
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL successfully connected');
        connection.release(); // คืนการเชื่อมต่อกลับสู่ pool
    } catch (err) {
        console.error('Error connecting to MySQL:', err.message);
    }
})();

// Export pool เพื่อใช้ในส่วนอื่น ๆ
module.exports = pool;
