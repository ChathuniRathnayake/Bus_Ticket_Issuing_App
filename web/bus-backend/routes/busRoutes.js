// routes/busRoutes.js
import express from "express";
import {
  createBus,
  getBuses,
  updateBus,
  deleteBus,
} from "../controllers/busController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


// ➕ Create Bus
router.post("/", verifyToken, verifyAdmin, createBus);

// 📄 Get All Buses
router.get("/", verifyToken, verifyAdmin, getBuses);

// ✏️ Update Bus
router.put("/:id", verifyToken, verifyAdmin, updateBus);

// ❌ Delete Bus
router.delete("/:id", verifyToken, verifyAdmin, deleteBus);


export default router;