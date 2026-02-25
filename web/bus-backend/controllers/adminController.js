// controllers/adminController.js
import { admin, db } from "../config/firebase.js";

/* =========================================================
   🔐 ADMIN LOGIN
========================================================= */
export const loginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check Firestore role
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

/* =========================================================
   ➕ CREATE ADMIN
========================================================= */
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // Create Firebase Auth user
    const user = await admin.auth().createUser({
      email,
      password,
    });

    // Store role in Firestore
    await db.collection("users").doc(user.uid).set({
      email,
      role: "admin",
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Admin created successfully",
      uid: user.uid,
    });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   📄 GET ALL ADMINS
========================================================= */
export const getAdmins = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(admins);

  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   ❌ DELETE ADMIN
========================================================= */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Admin ID required" });
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(id);

    // Delete Firestore record
    await db.collection("users").doc(id).delete();

    res.json({ message: "Admin deleted successfully" });

  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};