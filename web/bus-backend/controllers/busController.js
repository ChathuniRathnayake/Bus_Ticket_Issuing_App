// controllers/busController.js
import { admin, db } from "../config/firebase.js";

/* =====================================================
   CREATE BUS
   Only admin can create a bus
===================================================== */
export const createBus = async (req, res) => {
  try {
    const { busId, routeId, totalSeats, busNo, status } = req.body;

    if (!busId || !routeId || !totalSeats || !busNo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const adminId = req.user.uid; // Created by admin

    // 1️⃣ Save in buses collection
    const docRef = await db.collection("buses").add({
      busId,
      routeId,
      totalSeats: Number(totalSeats),
      busNo,
      status: status || "Active",
      createdBy: adminId,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Bus created successfully",
      id: docRef.id,
    });

  } catch (error) {
    console.error("Create Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET ALL BUSES
   Admin-only
===================================================== */
export const getBuses = async (req, res) => {
  try {
    const snapshot = await db.collection("buses").get();

    const buses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(buses);

  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET SINGLE BUS
===================================================== */
export const getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("buses").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    console.error("Get Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   UPDATE BUS
   Only admin can update
===================================================== */
export const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { busId, routeId, totalSeats, busNo, status } = req.body;

    // Update Firestore
    const updateData = {
      ...(busId && { busId }),
      ...(routeId && { routeId }),
      ...(totalSeats && { totalSeats: Number(totalSeats) }),
      ...(busNo && { busNo }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    await db.collection("buses").doc(id).update(updateData);

    res.status(200).json({ message: "Bus updated successfully" });

  } catch (error) {
    console.error("Update Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   DELETE BUS
   Only admin can delete
===================================================== */
export const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("buses").doc(id).delete();

    res.status(200).json({ message: "Bus deleted successfully" });

  } catch (error) {
    console.error("Delete Bus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};