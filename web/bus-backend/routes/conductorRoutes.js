import express from "express";
import {
  createConductor,
  getConductors,
  deleteConductor,
} from "../controllers/conductorController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createConductor);
router.get("/", verifyToken, verifyAdmin, getConductors);
router.delete("/:id", verifyToken, verifyAdmin, deleteConductor);

export default router;