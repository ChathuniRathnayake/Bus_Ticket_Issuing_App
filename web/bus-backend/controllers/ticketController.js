import { admin, db } from "../config/firebase.js";
import { allocateSeatInTransaction, expireStalePaymentReservations, isLegacySeatActive, journeySegmentsOverlap, validateJourneySegment } from "../services/seatAllocation.js";

export const createTicket = async (req, res) => {
  try {
    const { scheduleId, busId, seatNumber, seatNo, boardingStopId, dropStopId } = req.body;
    const requestedSeat = seatNumber ?? seatNo;
    if (!scheduleId || !busId || requestedSeat === undefined || !boardingStopId || !dropStopId) {
      return res.status(400).json({ message: "scheduleId, busId, seatNumber, boardingStopId and dropStopId are required" });
    }
    const bookingRef = db.collection("bookings").doc();
    const ticketRef = db.collection("tickets").doc(bookingRef.id);
    const allocation = await db.runTransaction(async (transaction) => allocateSeatInTransaction(transaction, {
      scheduleId,
      busId,
      seatNumber: requestedSeat,
      boardingStopId,
      dropStopId,
      userId: req.user.uid,
      bookingRef,
      ticketRef,
      bookingStatus: "CONFIRMED",
      ticketStatus: "BOOKED",
      passengerDetails: { bookingChannel: "online" },
    }));
    return res.status(201).json({ message: "Seat booked successfully", bookingId: bookingRef.id, segment: allocation.segment });

  } catch (error) {
    console.error("Create ticket error:", error);
    if (error.message === "SEAT_UNAVAILABLE") return res.status(409).json({ message: "Seat is reserved for an overlapping segment" });
    return res.status(400).json({ message: error.message || "Could not create ticket" });
  }
};

export const getBookedSeatsByBus = async (req, res) => {
  try {
    const { busId } = req.params;

    if (!busId) {
      return res.status(400).json({ message: "Missing busId" });
    }

    const ticketsSnap = await db
      .collection("tickets")
      .where("busId", "==", busId)
      .where("status", "in", ["BOOKED", "booked", "PENDING_PAYMENT"])
      .get();

    const tickets = ticketsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((ticket) => !req.query.scheduleId || !ticket.scheduleId || ticket.scheduleId === req.query.scheduleId);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.uid;

    const ticketsSnap = await db
      .collection("tickets")
      .where("userId", "==", userId)
      .where("status", "in", ["BOOKED", "booked"])
      .get();

    const tickets = ticketsSnap.docs.map((doc) => ({ bookingId: doc.id, ...doc.data() }));
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSegmentAvailability = async (req, res) => {
  try {
    const { scheduleId, busId, boardingStopId, dropStopId } = req.query;
    if (!scheduleId || !busId || !boardingStopId || !dropStopId) {
      return res.status(400).json({ message: "scheduleId, busId, boardingStopId and dropStopId are required" });
    }
    await expireStalePaymentReservations(scheduleId, busId);
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();
    if (!scheduleDoc.exists) return res.status(404).json({ message: "Schedule not found" });
    if (scheduleDoc.data().busId !== busId) return res.status(400).json({ message: "Bus does not match schedule" });
    const routeDoc = await db.collection("routes").doc(scheduleDoc.data().routeId).get();
    if (!routeDoc.exists) return res.status(404).json({ message: "Route not found" });
    const segment = validateJourneySegment(routeDoc.data(), boardingStopId, dropStopId);
    const [tickets, legacySeats] = await Promise.all([
      db.collection("tickets").where("busId", "==", busId).get(),
      db.collection("seats").where("busId", "==", busId).get(),
    ]);
    const occupiedSeats = tickets.docs.map((doc) => doc.data())
      .filter((ticket) => (!ticket.scheduleId || ticket.scheduleId === scheduleId)
        && journeySegmentsOverlap(segment, ticket)
        && ["PENDING_PAYMENT", "CHECKOUT_CREATED", "BOOKED", "booked", "CONFIRMED", "Confirmed"].includes(ticket.status))
      .map((ticket) => String(ticket.seatNo));
    legacySeats.docs.forEach((doc) => {
      const legacy = doc.data();
      if (isLegacySeatActive(legacy.status)) occupiedSeats.push(String(legacy.seatNo));
    });
    return res.json({ scheduleId, busId, boardingStopId, dropStopId, occupiedSeats: [...new Set(occupiedSeats)] });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not load seat availability" });
  }
};

export const issueConductorTicket = async (req, res) => {
  try {
    const { scheduleId, busId, seatNumber, boardingStopId, dropStopId, passengerName, passengerType, price } = req.body;
    if (!scheduleId || !busId || seatNumber === undefined || !boardingStopId || !dropStopId || !passengerName) {
      return res.status(400).json({ message: "Schedule, bus, seat, passenger name, boarding and destination are required" });
    }
    if (req.conductor.busId !== busId) return res.status(403).json({ message: "Conductor is not assigned to this bus" });
    if (!Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: "Ticket price is invalid" });
    const bookingRef = db.collection("bookings").doc();
    const ticketRef = db.collection("tickets").doc(bookingRef.id);
    const allocation = await db.runTransaction(async (transaction) => allocateSeatInTransaction(transaction, {
      scheduleId,
      busId,
      seatNumber,
      boardingStopId,
      dropStopId,
      userId: req.user.uid,
      bookingRef,
      ticketRef,
      bookingStatus: "CONFIRMED",
      ticketStatus: "BOOKED",
      passengerDetails: {
        passengerName: String(passengerName).trim(),
        passengerType: passengerType || "Adult",
        price: Number(price),
        issuedBy: req.user.uid,
        issuedAt: admin.firestore.FieldValue.serverTimestamp(),
        bookingChannel: "conductor",
      },
    }));
    return res.status(201).json({ message: "Ticket issued successfully", bookingId: bookingRef.id, ticketId: ticketRef.id, segment: allocation.segment });
  } catch (error) {
    if (error.message === "SEAT_UNAVAILABLE") return res.status(409).json({ message: "Seat is reserved for an overlapping segment" });
    return res.status(400).json({ message: error.message || "Could not issue ticket" });
  }
};