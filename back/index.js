const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");

dotenv.config(); // ✅ LOAD .env first

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/users", userRoutes);

// ✅ Health check
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
