import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingsBySchedule,
  cancelBooking,
} from "../controllers/bookingController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);
router.get("/schedule/:scheduleId", verifyToken, getBookingsBySchedule);
router.put("/cancel/:bookingId", verifyToken, cancelBooking);

export default router;