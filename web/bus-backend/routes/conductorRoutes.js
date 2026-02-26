import express from "express";
import {
  createConductor,
  getConductors,
  deleteConductor,
  getConductorById,
  updateConductor,
} from "../controllers/conductorController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createConductor);
router.get("/", verifyToken, verifyAdmin, getConductors);
router.get("/:id", verifyToken, verifyAdmin, getConductorById);
router.put("/:id", verifyToken, verifyAdmin, updateConductor);
router.delete("/:id", verifyToken, verifyAdmin, deleteConductor);

export default router;