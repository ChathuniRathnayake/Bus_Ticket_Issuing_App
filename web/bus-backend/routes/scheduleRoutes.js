import express from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All schedule routes require admin authentication
router.post("/", verifyToken, verifyAdmin, createSchedule);
router.get("/", verifyToken, verifyAdmin, getSchedules);
router.get("/:scheduleId", verifyToken, verifyAdmin, getScheduleById);
router.put("/:scheduleId", verifyToken, verifyAdmin, updateSchedule);
router.delete("/:scheduleId", verifyToken, verifyAdmin, deleteSchedule);

export default router;