import express from "express";
import { getBookedSeatsByBus, getUserTickets } from "../controllers/ticketController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/bus/:busId", verifyToken, getBookedSeatsByBus);
router.get("/me", verifyToken, getUserTickets);

export default router;