import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingsBySchedule,
  cancelBooking,
} from "../controllers/bookingController.js";

import { verifyPassenger, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyPassenger, createBooking);
router.get("/my", verifyToken, verifyPassenger, getMyBookings);
router.get("/schedule/:scheduleId", verifyToken, getBookingsBySchedule);
router.put("/cancel/:bookingId", verifyToken, verifyPassenger, cancelBooking);

export default router;