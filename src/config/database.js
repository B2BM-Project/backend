const mysql = require('mysql2');
require('dotenv').config(); // โหลดไฟล์ .env

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log('Error connecting to mysql', err);
        return;
    }
    console.log('Mysql successfully connected');
});

module.exports = connection;
