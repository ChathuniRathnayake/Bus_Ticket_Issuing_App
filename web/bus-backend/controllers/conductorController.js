import { admin, db } from "../config/firebase.js";

export const createConductor = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
    });

    await db.collection("users").doc(user.uid).set({
      email,
      name,
      role: "conductor",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Conductor created" });
  } catch (error) {
    console.error("Create conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConductors = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "conductor")
      .get();

    const conductors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(conductors);
  } catch (error) {
    console.error("Get conductors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteConductor = async (req, res) => {
  try {
    const { id } = req.params;

    await admin.auth().deleteUser(id);
    await db.collection("users").doc(id).delete();

    res.json({ message: "Conductor deleted" });
  } catch (error) {
    console.error("Delete conductor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};