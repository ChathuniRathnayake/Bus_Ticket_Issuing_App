import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import passengerRoutes from "./routes/passengerRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

dotenv.config();

const app = express();
app.use(cors());

// Stripe signs the exact raw request body, so this route must precede JSON parsing.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/conductor", conductorRoutes);
app.use("/api/passenger", passengerRoutes);
app.use("/api/route", routeRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => res.send("🚀 Backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));