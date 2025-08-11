// back/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Support either DB_PASSWORD or DB_PASS from .env
const password = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password,
  database: process.env.DB_NAME || "test_project",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
