import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengerProfile,
  updatePassengerProfile,
  searchBuses,
  getBusSeats,
  bookSeat
} from "../controllers/passengerController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


// =========================
// 🔐 AUTH
// =========================

// Register passenger
router.post("/register", registerPassenger);

// Login passenger
router.post("/login", loginPassenger);


// =========================
// 👤 PROFILE
// =========================

// Get logged passenger profile
router.get("/profile", verifyToken, getPassengerProfile);

// Update profile
router.put("/profile", verifyToken, updatePassengerProfile);


// =========================
// 🔎 BUS SEARCH
// =========================

// Get all buses (search later can filter)
router.get("/search-buses", searchBuses);


// =========================
// 💺 SEATS
// =========================

// Get seat layout of bus
router.get("/bus/:busId/seats", getBusSeats);


// =========================
// 🎟 BOOKING
// =========================

// Book seat
router.post("/book-seat", verifyToken, bookSeat);


export default router;