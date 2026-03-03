import express from "express";
import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
} from "../controllers/busController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All bus routes require admin authentication
router.post("/", verifyToken, verifyAdmin, createBus);
router.get("/", verifyToken, verifyAdmin, getBuses);
router.get("/:busId", verifyToken, verifyAdmin, getBusById);
router.put("/:busId", verifyToken, verifyAdmin, updateBus);
router.delete("/:busId", verifyToken, verifyAdmin, deleteBus);

export default router;