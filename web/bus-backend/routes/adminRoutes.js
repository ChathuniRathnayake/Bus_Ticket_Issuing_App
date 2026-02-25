// routes/adminRoutes.js
import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Login route
router.post("/login", loginAdmin);

// Example protected admin route
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

export default router;