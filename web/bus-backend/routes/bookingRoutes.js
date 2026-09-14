import express from "express";
import {
  getMyBookings,
  getBookingsBySchedule,
  cancelBooking,
} from "../controllers/bookingController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", verifyToken, getMyBookings);
router.get("/schedule/:scheduleId", verifyToken, getBookingsBySchedule);
router.put("/cancel/:bookingId", verifyToken, cancelBooking);

export default router;