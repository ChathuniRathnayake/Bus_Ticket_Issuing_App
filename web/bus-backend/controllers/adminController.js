// web/bus-backend/controllers/adminController.js
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body; // Firebase ID token from frontend

    if (!idToken) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user has admin role
    if (!decodedToken.role || decodedToken.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Issue backend JWT for your APIs (optional)
    const token = jwt.sign(
      { uid: decodedToken.uid, email: decodedToken.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};