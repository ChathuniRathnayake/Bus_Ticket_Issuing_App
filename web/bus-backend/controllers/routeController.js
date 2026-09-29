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
      priceCents,
      stops,
    } = req.body;

    if (
      !routeId ||
      !routeName ||
      !startStop ||
      !endStop ||
      !distance ||
      !duration
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

    // A route is path-only; timing lives on schedules. Persist legacy
    // timing fields only when explicitly supplied so Firestore never
    // receives undefined values.
    const routeDoc = {
      routeId,
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      stops: orderedStops,
      createdAt: new Date(),
    };
    if (startTime) routeDoc.startTime = startTime;
    if (endTime) routeDoc.endTime = endTime;
    if (date) routeDoc.date = date;
    if (priceCents !== undefined && priceCents !== null && priceCents !== "") {
      const cents = Math.round(Number(priceCents));
      if (!Number.isFinite(cents) || cents < 0) {
        return res.status(400).json({ message: "Fare must be a non-negative amount" });
      }
      routeDoc.priceCents = cents;
    }

    await db.collection("routes").doc(routeId).set(routeDoc);

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

    // Sort alphabetically by route name (routes are path-only, no timing).
    routes.sort((a, b) => {
      const nameA = String(a.routeName || a.routeId || "");
      const nameB = String(b.routeName || b.routeId || "");
      return nameA.localeCompare(nameB);
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
      const nameA = String(a.routeName || a.routeId || "");
      const nameB = String(b.routeName || b.routeId || "");
      return nameA.localeCompare(nameB);
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
      priceCents,
      stops,
    } = req.body;

    const routeRef = db.collection("routes").doc(id);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    const orderedStops = stops === undefined ? undefined : normalizeStops(stops);
    const updatePayload = {
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
    };
    if (priceCents !== undefined && priceCents !== null && priceCents !== "") {
      const cents = Math.round(Number(priceCents));
      if (!Number.isFinite(cents) || cents < 0) {
        return res.status(400).json({ message: "Fare must be a non-negative amount" });
      }
      updatePayload.priceCents = cents;
    }
    await routeRef.update(updatePayload);

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