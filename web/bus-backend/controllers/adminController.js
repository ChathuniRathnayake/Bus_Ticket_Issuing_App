// controllers/adminController.js
import { admin, db } from "../config/firebase.js";

export const loginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check role in Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({ message: "User not found" });
    }

    if (userDoc.data().role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    res.json({
      message: "Admin login successful",
      uid,
      email: decodedToken.email,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};