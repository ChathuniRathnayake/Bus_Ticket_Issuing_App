import { db } from "../config/firebase.js";

export const createRoute = async (req, res) => {
  try {
    const docRef = await db.collection("routes").add(req.body);
    res.status(201).json({ id: docRef.id, message: "Route created" });
  } catch (error) {
    console.error("Create route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const snapshot = await db.collection("routes").get();

    const routes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(routes);
  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRoute = async (req, res) => {
  try {
    await db.collection("routes").doc(req.params.id).update(req.body);
    res.json({ message: "Route updated" });
  } catch (error) {
    console.error("Update route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    await db.collection("routes").doc(req.params.id).delete();
    res.json({ message: "Route deleted" });
  } catch (error) {
    console.error("Delete route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};