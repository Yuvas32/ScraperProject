const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const PORT = process.env.PORT || 3001;
const dotenv = require("dotenv");
const router = express.Router();

// Middlewares
app.use(cors());
app.use(express.json());

const workerRoutes = require("./routes/workerRoutes");
dotenv.config();
app.use("/api/workers", workerRoutes);

// ✅ Connect to MySQL FIRST (safe to do early)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // ✅ empty string
  database: process.env.DB_NAME || "test_project",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});


// ✅ Routes (define each route ONCE) - check working Backend
app.get("/test", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.get("/users", (req, res) => {
  const query = "SELECT * FROM users";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// router.get("/", workerController.getAllWorkers); // GET /api/workers
// router.post("/", workerController.createWorker); // POST /api/workers

// ✅ Start the server LAST
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
