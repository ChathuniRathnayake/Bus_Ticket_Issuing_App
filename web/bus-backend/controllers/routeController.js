import { db } from "../config/firebase.js";

/* =====================================================
   CREATE ROUTE
===================================================== */
export const createRoute = async (req, res) => {
  try {
    const {
      routeId,
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      startTime,
      endTime,
    } = req.body;

    if (
      !routeId ||
      !routeName ||
      !startStop ||
      !endStop ||
      !distance ||
      !duration ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if route already exists
    const existingRoute = await db.collection("routes").doc(routeId).get();
    if (existingRoute.exists) {
      return res.status(400).json({ message: "Route ID already exists" });
    }

    await db.collection("routes").doc(routeId).set({
      routeId,
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      startTime,
      endTime,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Route created successfully" });

  } catch (error) {
    console.error("Create route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET ALL ROUTES
===================================================== */
export const getRoutes = async (req, res) => {
  try {
    const snapshot = await db.collection("routes").get();

    const routes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(routes);

  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET SINGLE ROUTE
===================================================== */
export const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("routes").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    console.error("Get route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   UPDATE ROUTE
===================================================== */
export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      startTime,
      endTime,
    } = req.body;

    const routeRef = db.collection("routes").doc(id);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    await routeRef.update({
      ...(routeName && { routeName }),
      ...(startStop && { startStop }),
      ...(endStop && { endStop }),
      ...(distance && { distance }),
      ...(duration && { duration }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Route updated successfully" });

  } catch (error) {
    console.error("Update route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   DELETE ROUTE
===================================================== */
export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const routeRef = db.collection("routes").doc(id);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    await routeRef.delete();

    res.status(200).json({ message: "Route deleted successfully" });

  } catch (error) {
    console.error("Delete route error:", error);
    res.status(500).json({ message: "Server error" });
  }
};