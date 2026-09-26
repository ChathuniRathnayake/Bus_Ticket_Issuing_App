import express from "express";
import { createTicket, getBookedSeatsByBus, getUserTickets, getSegmentAvailability, issueConductorTicket } from "../controllers/ticketController.js";
import { verifyConductor, verifyPassenger, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// passengers can book → only token needed (NOT admin)
router.get("/availability", verifyToken, getSegmentAvailability);
router.post("/conductor/issue", verifyToken, verifyConductor, issueConductorTicket);
router.post("/", verifyToken, verifyPassenger, createTicket);
router.get("/bus/:busId", verifyToken, getBookedSeatsByBus);
router.get("/me", verifyToken, getUserTickets);

export default router;