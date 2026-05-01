import { db } from "../config/firebase.js";

// CREATE SCHEDULE
export const createSchedule = async (req, res) => {
  try {
    const {
      scheduleId,
      busId,
      routeId,
      date,
      departureTime,
      status,
    } = req.body;

    if (!scheduleId || !busId || !routeId || !date || !departureTime) {
      return res.status(400).json({
        message: "scheduleId, busId, routeId, date, departureTime are required",
      });
    }

    // Check if bus exists
    const busDoc = await db.collection("buses").doc(busId).get();
    if (!busDoc.exists)
      return res.status(400).json({ message: "Bus does not exist" });

    // Check if route exists
    const routeDoc = await db.collection("routes").doc(routeId).get();
    if (!routeDoc.exists)
      return res.status(400).json({ message: "Route does not exist" });

    // Check if schedule ID already exists
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();
    if (scheduleDoc.exists)
      return res.status(400).json({ message: "Schedule ID already exists" });

    // Check for schedule conflicts (same bus, same date, overlapping time)
    const schedulesSnap = await db.collection("schedules")
      .where("busId", "==", busId)
      .where("date", "==", date)
      .get();

    const routeData = routeDoc.data();
    const [durationHours, durationMinutes] = routeData.duration.split(':').map(Number);
    const departureDateTime = new Date(`${date}T${departureTime}`);
    const arrivalDateTime = new Date(departureDateTime.getTime() + (durationHours * 60 * 60 * 1000) + (durationMinutes * 60 * 1000));

    for (const doc of schedulesSnap.docs) {
      const existingSchedule = doc.data();
      const existingDeparture = new Date(`${existingSchedule.date}T${existingSchedule.departureTime}`);
      const existingRoute = await db.collection("routes").doc(existingSchedule.routeId).get();
      const existingRouteData = existingRoute.data();
      const [existingDurationHours, existingDurationMinutes] = existingRouteData.duration.split(':').map(Number);
      const existingArrival = new Date(existingDeparture.getTime() + (existingDurationHours * 60 * 60 * 1000) + (existingDurationMinutes * 60 * 1000));

      // Check for time overlap
      if ((departureDateTime < existingArrival && arrivalDateTime > existingDeparture)) {
        return res.status(400).json({
          message: "Schedule conflicts with existing schedule for this bus on the same date"
        });
      }
    }

    await db.collection("schedules").doc(scheduleId).set({
      scheduleId,
      busId,
      routeId,
      date,
      departureTime,
      status: status || "Active",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Schedule created successfully", scheduleId });

  } catch (error) {
    console.error("Create Schedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL SCHEDULES
export const getSchedules = async (req, res) => {
  try {
    const schedulesSnap = await db.collection("schedules").get();
    const schedules = schedulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(schedules);
  } catch (error) {
    console.error("Get Schedules Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SCHEDULE BY ID
export const getScheduleById = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({ id: scheduleDoc.id, ...scheduleDoc.data() });
  } catch (error) {
    console.error("Get Schedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE SCHEDULE
export const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { busId, routeId, date, departureTime, status } = req.body;

    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();
    if (!scheduleDoc.exists) return res.status(404).json({ message: "Schedule not found" });

    // If updating bus, route, date, or time, check for conflicts
    if (busId || routeId || date || departureTime) {
      const currentSchedule = scheduleDoc.data();
      const checkBusId = busId || currentSchedule.busId;
      const checkRouteId = routeId || currentSchedule.routeId;
      const checkDate = date || currentSchedule.date;
      const checkDepartureTime = departureTime || currentSchedule.departureTime;

      // Check if bus exists
      const busDoc = await db.collection("buses").doc(checkBusId).get();
      if (!busDoc.exists)
        return res.status(400).json({ message: "Bus does not exist" });

      // Check if route exists
      const routeDoc = await db.collection("routes").doc(checkRouteId).get();
      if (!routeDoc.exists)
        return res.status(400).json({ message: "Route does not exist" });

      // Check for conflicts
      const schedulesSnap = await db.collection("schedules")
        .where("busId", "==", checkBusId)
        .where("date", "==", checkDate)
        .get();

      const routeData = routeDoc.data();
      const [durationHours, durationMinutes] = routeData.duration.split(':').map(Number);
      const departureDateTime = new Date(`${checkDate}T${checkDepartureTime}`);
      const arrivalDateTime = new Date(departureDateTime.getTime() + (durationHours * 60 * 60 * 1000) + (durationMinutes * 60 * 1000));

      for (const doc of schedulesSnap.docs) {
        if (doc.id === scheduleId) continue; // Skip current schedule

        const existingSchedule = doc.data();
        const existingDeparture = new Date(`${existingSchedule.date}T${existingSchedule.departureTime}`);
        const existingRoute = await db.collection("routes").doc(existingSchedule.routeId).get();
        const existingRouteData = existingRoute.data();
        const [existingDurationHours, existingDurationMinutes] = existingRouteData.duration.split(':').map(Number);
        const existingArrival = new Date(existingDeparture.getTime() + (existingDurationHours * 60 * 60 * 1000) + (existingDurationMinutes * 60 * 1000));

        // Check for time overlap
        if ((departureDateTime < existingArrival && arrivalDateTime > existingDeparture)) {
          return res.status(400).json({
            message: "Schedule conflicts with existing schedule for this bus on the same date"
          });
        }
      }
    }

    const updatedData = {};
    if (busId) updatedData.busId = busId;
    if (routeId) updatedData.routeId = routeId;
    if (date) updatedData.date = date;
    if (departureTime) updatedData.departureTime = departureTime;
    if (status) updatedData.status = status;
    updatedData.updatedAt = new Date();

    await db.collection("schedules").doc(scheduleId).update(updatedData);

    res.json({ message: "Schedule updated successfully" });
  } catch (error) {
    console.error("Update Schedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE SCHEDULE
export const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();

    if (!scheduleDoc.exists) return res.status(404).json({ message: "Schedule not found" });

    await db.collection("schedules").doc(scheduleId).delete();

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Delete Schedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};