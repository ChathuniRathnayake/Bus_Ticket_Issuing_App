// controllers/adminController.js
import { admin, db } from "../config/firebase.js";

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "No token provided" });

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check role in users collection
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(403).json({ message: "User not found" });
    if (userDoc.data().role !== "admin")
      return res.status(403).json({ message: "Not authorized as admin" });

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

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({ email, password });
    const uid = userRecord.uid;

    // Store in users collection
    await db.collection("users").doc(uid).set({
      email,
      role: "admin",
      createdAt: new Date(),
    });

    // Store in admins collection
    await db.collection("admins").doc(uid).set({
      adminId: uid,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Admin created successfully", uid });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all admins
export const getAdmins = async (req, res) => {
  try {
    const snapshot = await db.collection("admins").get();
    const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(admins);
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params; // admin UID
    const { email, password } = req.body;

    if (!id) return res.status(400).json({ message: "Admin ID required" });

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    // Update Firebase Auth
    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(id, updateData);
    }

    // Update Firestore - users collection
    const updateFirestore = {};
    if (email) updateFirestore.email = email;

    if (Object.keys(updateFirestore).length > 0) {
      await db.collection("users").doc(id).update(updateFirestore);
      await db.collection("admins").doc(id).update(updateFirestore);
    }

    res.json({ message: "Admin updated successfully" });

  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Admin ID required" });

    await admin.auth().deleteUser(id);
    await db.collection("users").doc(id).delete();
    await db.collection("admins").doc(id).delete();

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
