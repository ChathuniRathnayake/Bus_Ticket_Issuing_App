import express from "express";
import { createTicket } from "../controllers/ticketController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// passengers can book → only token needed (NOT admin)
router.post("/", verifyToken, createTicket);

export default router;