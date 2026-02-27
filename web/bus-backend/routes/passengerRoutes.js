import express from "express";
import {
  registerPassenger,
  loginPassenger,
 
} from "../controllers/passengerController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register passenger
router.post("/register", registerPassenger);

// Login passenger
router.post("/login", loginPassenger);





export default router;