import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import scrapeRoutes from "./routes/scrapeRoutes.js";

dotenv.config(); // ✅ LOAD .env first

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/users", userRoutes);

// ✅ Routes
app.use("/scrape", scrapeRoutes);

// ✅ Health check
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
