import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

import { workerRoutes } from "./routes"; // must add `.js` if using modules

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_project",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// ✅ Routes
app.use("/api/workers", workerRoutes);

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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
