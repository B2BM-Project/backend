const mysql = require('mysql2');
require('dotenv').config(); // โหลดไฟล์ .env

// ใช้ pool แทนการเชื่อมต่อปกติ
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

// ใช้ pool.promise() เพื่อรองรับ async/await
const connection = pool.promise();

pool.getConnection((err, conn) => {
    if (err) {
        console.log('Error connecting to mysql', err);
        return;
    }
    console.log('Mysql successfully connected');
    conn.release();  // อย่าลืมปล่อย connection เมื่อเสร็จ
});

module.exports = connection;  // ส่งออก pool.promise() เพื่อใช้ในไฟล์อื่น
