import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

// Import service account JSON
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes (⚠️ must include .js extension in ESM)
import passengerRoutes from "./routes/passengerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/passenger", passengerRoutes);
app.use("/api/admin", adminRoutes);

// Port config
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});