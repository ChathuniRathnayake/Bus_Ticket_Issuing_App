import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

// Import service account from config folder
import serviceAccount from "./config/serviceAccountKey.json" assert { type: "json" };

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import admin routes
import adminRoutes from "./routes/adminRoutes.js";

// Use routes
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is connected!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});