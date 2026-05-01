import express from "express";
import { createTicket, getBookedSeatsByBus, getUserTickets } from "../controllers/ticketController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// passengers can book → only token needed (NOT admin)
router.post("/", verifyToken, createTicket);
router.get("/bus/:busId", verifyToken, getBookedSeatsByBus);
router.get("/me", verifyToken, getUserTickets);

export default router;