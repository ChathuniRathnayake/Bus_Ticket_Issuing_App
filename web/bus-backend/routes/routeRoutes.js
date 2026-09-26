import express from "express";
import {
  createRoute,
  getRoutes,
  getAvailableRoutes,
  getAvailableStops,
  getRouteById,
  updateRoute,
  deleteRoute,
} from "../controllers/routeController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createRoute);
router.get("/", verifyToken, verifyAdmin, getRoutes);
router.get("/available", verifyToken, getAvailableRoutes);
router.get("/stops/available", verifyToken, getAvailableStops);
router.get("/:id", verifyToken, verifyAdmin, getRouteById);
router.put("/:id", verifyToken, verifyAdmin, updateRoute);
router.delete("/:id", verifyToken, verifyAdmin, deleteRoute);

export default router;