// controllers/busController.js
import { db } from "../config/firebase.js";


// ➕ Create Bus
export const createBus = async (req, res) => {
  try {
    const { busId, routeId, totalSeats, busNo, status } = req.body;

    if (!busId || !routeId || !totalSeats || !busNo) {
      return res.status(400).json({ message: "All fields required" });
    }

    const docRef = await db.collection("buses").add({
      busId,
      routeId,
      totalSeats: Number(totalSeats),
      busNo,
      status: status || "Active",
      createdAt: new Date(),
    });

    res.json({
      message: "Bus created successfully",
      id: docRef.id,
    });

  } catch (error) {
    console.error("Create Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// 📄 Get All Buses
export const getBuses = async (req, res) => {
  try {
    const snapshot = await db.collection("buses").get();

    const buses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(buses);

  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✏️ Update Bus
export const updateBus = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("buses").doc(id).update(req.body);

    res.json({ message: "Bus updated successfully" });

  } catch (error) {
    console.error("Update Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ❌ Delete Bus
export const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("buses").doc(id).delete();

    res.json({ message: "Bus deleted successfully" });

  } catch (error) {
    console.error("Delete Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};