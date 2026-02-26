import { admin, db } from "../config/firebase.js";

/* =====================================================
   CREATE CONDUCTOR
===================================================== */
export const createConductor = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const adminId = req.user.uid;

    // 1️⃣ Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const conductorId = userRecord.uid;

    // 2️⃣ Save in users collection
    await db.collection("users").doc(conductorId).set({
      email,
      name,
      role: "conductor",
      createdBy: adminId,
      createdAt: new Date(),
    });

    // 3️⃣ Save in conductors collection
    await db.collection("conductors").doc(conductorId).set({
      conductorId,
      name,
      email,
      createdBy: adminId,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Conductor created successfully" });

  } catch (error) {
    console.error("Create conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET ALL CONDUCTORS
===================================================== */
export const getConductors = async (req, res) => {
  try {
    const snapshot = await db.collection("conductors").get();

    const conductors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(conductors);

  } catch (error) {
    console.error("Get conductors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET SINGLE CONDUCTOR
===================================================== */
export const getConductorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("conductors").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Conductor not found" });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    console.error("Get conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   UPDATE CONDUCTOR
===================================================== */
export const updateConductor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // 1️⃣ Update Firebase Auth
    const updateAuthData = {};

    if (email) updateAuthData.email = email;
    if (password) updateAuthData.password = password;
    if (name) updateAuthData.displayName = name;

    if (Object.keys(updateAuthData).length > 0) {
      await admin.auth().updateUser(id, updateAuthData);
    }

    // 2️⃣ Update Firestore - conductors
    await db.collection("conductors").doc(id).update({
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: new Date(),
    });

    // 3️⃣ Update Firestore - users
    await db.collection("users").doc(id).update({
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Conductor updated successfully" });

  } catch (error) {
    console.error("Update conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   DELETE CONDUCTOR
===================================================== */
export const deleteConductor = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Delete from Firebase Auth
    await admin.auth().deleteUser(id);

    // 2️⃣ Delete from Firestore
    await db.collection("users").doc(id).delete();
    await db.collection("conductors").doc(id).delete();

    res.status(200).json({ message: "Conductor deleted successfully" });

  } catch (error) {
    console.error("Delete conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};