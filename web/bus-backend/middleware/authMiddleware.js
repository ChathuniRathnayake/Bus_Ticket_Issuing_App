// middleware/authMiddleware.js
import { admin, db } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach user info to request
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Optional: Admin role check middleware
export const verifyAdmin = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    if (userData.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};