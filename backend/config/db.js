const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "QuanLyPhongTro",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "local",
  decimalNumbers: true,
});

module.exports = db;
