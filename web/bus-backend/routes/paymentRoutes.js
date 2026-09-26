import express from "express";
import {
  createCheckoutSession,
  cancelPayment,
  getPaymentStatus,
  getPaymentHistory,
} from "../controllers/paymentController.js";
import { verifyPassenger, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout-session", verifyToken, verifyPassenger, createCheckoutSession);
router.post("/:paymentId/cancel", verifyToken, cancelPayment);
router.get("/:paymentId/status", verifyToken, getPaymentStatus);
router.get("/history", verifyToken, getPaymentHistory);

export default router;