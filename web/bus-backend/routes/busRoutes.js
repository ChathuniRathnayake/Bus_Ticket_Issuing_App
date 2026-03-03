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



router.post("/", verifyToken, verifyAdmin, createBus);
router.get("/", verifyToken, verifyAdmin, getBuses);
router.put("/:id", verifyToken, verifyAdmin, updateBus);
router.delete("/:id", verifyToken, verifyAdmin, deleteBus);


export default router;