const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");

// GET all workers
router.get("/", workerController.getAllWorkers);

// POST new worker
router.post("/", workerController.createWorker);

module.exports = router; // ✅ THIS LINE IS CRITICAL

