import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import passengerRoutes from "./routes/passengerRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/conductor", conductorRoutes);
app.use("/api/passenger", passengerRoutes);
app.use("/api/route", routeRoutes);
app.use("/api/ticket", ticketRoutes);

app.get("/", (req, res) => res.send("🚀 Backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));