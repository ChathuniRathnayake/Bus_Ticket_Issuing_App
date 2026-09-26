import { db, admin } from "../config/firebase.js";
import { allocateSeatInTransaction, setTicketLocksStatus } from "../services/seatAllocation.js";

/* =====================================================
   CREATE BOOKING (Seat Reservation)
===================================================== */
export const createBooking = async (req, res) => {
  try {
    const { scheduleId, busId, seatNumber, boardingStopId, dropStopId } = req.body;

    const userId = req.user.uid; // from Firebase token

    if (!scheduleId || !busId || !seatNumber || !boardingStopId || !dropStopId) {
      return res.status(400).json({
        message: "scheduleId, busId, seatNumber, boardingStopId and dropStopId are required",
      });
    }
    const bookingRef = db.collection("bookings").doc();
    const ticketRef = db.collection("tickets").doc(bookingRef.id);
    const allocation = await db.runTransaction(async (transaction) => allocateSeatInTransaction(transaction, {
      scheduleId,
      busId,
      seatNumber,
      boardingStopId,
      dropStopId,
      userId,
      bookingRef,
      ticketRef,
      bookingStatus: "CONFIRMED",
      ticketStatus: "BOOKED",
      passengerDetails: { bookingChannel: "passenger_app" },
    }));
    return res.status(201).json({
      message: "Booking successful",
      bookingId: bookingRef.id,
      ticketId: ticketRef.id,
      segment: allocation.segment,
    });

  } catch (error) {
    console.error("Create Booking Error:", error);
    if (error.message === "SEAT_UNAVAILABLE") return res.status(409).json({ message: "Seat is reserved for an overlapping segment" });
    if (/stop|Destination|Boarding|Alighting|Schedule|Bus|Route/i.test(error.message)) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET BOOKINGS FOR LOGGED USER
===================================================== */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("bookings")
      .where("userId", "==", userId)
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(bookings);

  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET BOOKINGS FOR A SCHEDULE (for seat layout)
===================================================== */
export const getBookingsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const snapshot = await db.collection("tickets").where("scheduleId", "==", scheduleId).get();
    const bookedSeats = snapshot.docs.map((doc) => doc.data())
      .filter((ticket) => ["BOOKED", "booked", "PENDING_PAYMENT"].includes(ticket.status))
      .map((ticket) => ticket.seatNo);

    res.json(bookedSeats);

  } catch (error) {
    console.error("Get Schedule Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   CANCEL BOOKING
===================================================== */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.uid;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const ticketRef = db.collection("tickets").doc(bookingId);
    await db.runTransaction(async (transaction) => {
      const [booking, ticket] = await Promise.all([transaction.get(bookingRef), transaction.get(ticketRef)]);
      if (!booking.exists || booking.data().userId !== userId) throw new Error("BOOKING_NOT_FOUND");
      await setTicketLocksStatus(transaction, ticketRef.id, "RELEASED");
      transaction.update(bookingRef, { status: "CANCELLED", cancelledAt: admin.firestore.FieldValue.serverTimestamp() });
      if (ticket.exists) transaction.update(ticketRef, { status: "CANCELLED", cancelledAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    return res.json({ message: "Booking cancelled successfully" });

  } catch (error) {
    console.error("Cancel Booking Error:", error);
    if (error.message === "BOOKING_NOT_FOUND") return res.status(404).json({ message: "Booking not found" });
    res.status(500).json({ message: "Server error" });
  }
};