// routes/adminRoutes.js
import express from "express";
import {
  loginAdmin,
  createAdmin,
  getAdmins,
  deleteAdmin,
} from "../controllers/adminController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Login
router.post("/login", loginAdmin);

// Admin Management (Protected)
router.post("/", verifyToken, verifyAdmin, createAdmin);
router.get("/", verifyToken, verifyAdmin, getAdmins);
router.delete("/:id", verifyToken, verifyAdmin, deleteAdmin);

// Test route
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

export default router;