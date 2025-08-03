const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET all users
router.get("/", userController.getAllUsers);

// POST new user
router.post("/", userController.createUser);

// DELETE user
router.delete("/:id", userController.deleteUser);

// UPDATE user
router.put("/:id", userController.updateUser);

// ✅ LOGIN route
router.post("/login", userController.loginUser);

module.exports = router;
