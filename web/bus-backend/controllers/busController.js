import { db } from "../config/firebase.js";

// CREATE BUS
export const createBus = async (req, res) => {
  try {
    const { busId, routeId, busNo, totalSeats, status } = req.body;

    if (!busId || !routeId || !busNo || !totalSeats) {
      return res.status(400).json({
        message: "busId, routeId, busNo, totalSeats are required",
      });
    }

    // Check if route exists
    const routeDoc = await db.collection("routes").doc(routeId).get();
    if (!routeDoc.exists)
      return res.status(400).json({ message: "Route does not exist" });

    // Check if busId already exists
    const busDoc = await db.collection("buses").doc(busId).get();
    if (busDoc.exists)
      return res.status(400).json({ message: "Bus ID already exists" });

    // Use busId as document ID
    await db.collection("buses").doc(busId).set({
      busNo,
      routeId,
      totalSeats: Number(totalSeats),
      status: status || "Active",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Bus created successfully", busId });
  } catch (error) {
    console.error("Create Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL BUSES
export const getBuses = async (req, res) => {
  try {
    const busesSnap = await db.collection("buses").get();
    const buses = busesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(buses);
  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BUS BY ID
export const getBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    const busDoc = await db.collection("buses").doc(busId).get();

    if (!busDoc.exists) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({ id: busDoc.id, ...busDoc.data() });
  } catch (error) {
    console.error("Get Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE BUS
export const updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { busNo, routeId, totalSeats, status } = req.body;

    const busDoc = await db.collection("buses").doc(busId).get();
    if (!busDoc.exists) return res.status(404).json({ message: "Bus not found" });

    const updatedData = {};
    if (busNo) updatedData.busNo = busNo;
    if (routeId) updatedData.routeId = routeId;
    if (totalSeats) updatedData.totalSeats = Number(totalSeats);
    if (status) updatedData.status = status;
    updatedData.updatedAt = new Date();

    await db.collection("buses").doc(busId).update(updatedData);

    res.json({ message: "Bus updated successfully" });
  } catch (error) {
    console.error("Update Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE BUS
export const deleteBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const busDoc = await db.collection("buses").doc(busId).get();

    if (!busDoc.exists) return res.status(404).json({ message: "Bus not found" });

    await db.collection("buses").doc(busId).delete();

    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};