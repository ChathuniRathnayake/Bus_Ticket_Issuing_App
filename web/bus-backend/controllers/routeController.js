import { db } from "../config/firebase.js";

const slugStop = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function normalizeStops(input) {
  if (!Array.isArray(input) || input.length < 2) throw new Error("Routes require an ordered list of at least two stops");
  const seen = new Set();
  return input.map((raw, sequence) => {
    const source = typeof raw === "string" ? { name: raw } : raw;
    const name = String(source?.name || "").trim();
    if (!name) throw new Error(`Stop ${sequence + 1} must have a name`);
    const stopType = source.stopType || "normal_road_waypoint";
    const stopId = source.stopId || `${slugStop(name)}-${sequence + 1}`;
    if (seen.has(stopId)) throw new Error(`Duplicate stop ID: ${stopId}`);
    seen.add(stopId);
    const isInterchange = ["expressway_interchange", "expressway_segment"].includes(stopType);
    return {
      stopId,
      name,
      sequence,
      stopType,
      boardingAllowed: !isInterchange && source.boardingAllowed === true,
      alightingAllowed: !isInterchange && source.alightingAllowed === true,
      ...(Number.isFinite(Number(source.estimatedMinutesFromOrigin))
        ? { estimatedMinutesFromOrigin: Number(source.estimatedMinutesFromOrigin) }
        : {}),
      ...(source.timingBasis ? { timingBasis: source.timingBasis } : {}),
      ...(Array.isArray(source.sourceUrls) ? { sourceUrls: source.sourceUrls } : {}),
    };
  });
}

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
      date,
      stops,
    } = req.body;

    if (
      !routeId ||
      !routeName ||
      !startStop ||
      !endStop ||
      !distance ||
      !duration ||
      !startTime ||
      !endTime ||
      !date
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if route already exists
    const existingRoute = await db.collection("routes").doc(routeId).get();
    if (existingRoute.exists) {
      return res.status(400).json({ message: "Route ID already exists" });
    }

    const orderedStops = normalizeStops(stops || [
      { name: startStop, stopType: "terminal", boardingAllowed: true },
      { name: endStop, stopType: "terminal", alightingAllowed: true },
    ]);

    await db.collection("routes").doc(routeId).set({
      routeId,
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      startTime,
      endTime,
      date,
      stops: orderedStops,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Route created successfully" });

  } catch (error) {
    console.error("Create route error:", error);
    res.status(400).json({ message: error.message || "Server error" });
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

    // Sort by date and time in ascending order
    routes.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });

    res.status(200).json(routes);

  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableRoutes = async (req, res) => {
  try {
    const snapshot = await db.collection("routes").get();
    const routes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    routes.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });
    res.json(routes);
  } catch (error) {
    console.error("Get Available Routes Error:", error);
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
      date,
      stops,
    } = req.body;

    const routeRef = db.collection("routes").doc(id);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    const orderedStops = stops === undefined ? undefined : normalizeStops(stops);
    await routeRef.update({
      ...(routeName && { routeName }),
      ...(startStop && { startStop }),
      ...(endStop && { endStop }),
      ...(distance && { distance }),
      ...(duration && { duration }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(date && { date }),
      ...(orderedStops && { stops: orderedStops }),
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Route updated successfully" });

  } catch (error) {
    console.error("Update route error:", error);
    res.status(400).json({ message: error.message || "Server error" });
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

export const getAvailableStops = async (req, res) => {
  try {
    const snapshot = await db.collection("routes").get();
    const stopsByName = new Map();
    snapshot.docs.forEach((doc) => {
      const stops = doc.data().stops || [];
      stops.forEach((stop) => {
        if (typeof stop === "string" || !stop.name) return;
        if (!stop.boardingAllowed && !stop.alightingAllowed) return;
        const key = stop.name.trim().toLowerCase();
        const entry = stopsByName.get(key) || { name: stop.name, boardingAllowed: false, alightingAllowed: false };
        entry.boardingAllowed ||= stop.boardingAllowed === true;
        entry.alightingAllowed ||= stop.alightingAllowed === true;
        stopsByName.set(key, entry);
      });
    });
    return res.json([...stopsByName.values()].sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error("Get available stops error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};