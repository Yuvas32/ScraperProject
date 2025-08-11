// back/routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.post("/login", loginUser);

export default router;
