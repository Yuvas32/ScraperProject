const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { SelectAllUsers } = require("./Queries");

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL FIRST (safe to do early)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // ✅ empty string
  database: "test_project",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// ✅ Routes (define each route ONCE) - check working Backend
app.get("test", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.get("/users", (req, res) => {
  connection.query(SelectAllUsers, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// ✅ Start the server LAST
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
