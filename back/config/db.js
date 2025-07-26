const mysql = require("mysql2");
require("dotenv").config(); // ✅ חשוב! לפני הגדרות

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_project",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    throw err;
  }
  console.log("✅ Connected to MySQL");
});

module.exports = connection;
