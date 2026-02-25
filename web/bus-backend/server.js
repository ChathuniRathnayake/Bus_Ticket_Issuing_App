// web/bus-backend/index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
const PORT = process.env.PORT || 5000;

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

// Example placeholder routes (add your routes later)
// app.use("/api/passenger", passengerRoutes);
// app.use("/api/admin", adminRoutes);

// Start server




// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is working!");
});



// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend is connected and running on port ${PORT}`);
});