import { db, admin } from "../config/firebase.js";

/* =====================================================
   CREATE BOOKING (Seat Reservation)
===================================================== */
export const createBooking = async (req, res) => {
  try {
    const { scheduleId, busId, seatNumber } = req.body;

    const userId = req.user.uid; // from Firebase token

    if (!scheduleId || !busId || !seatNumber) {
      return res.status(400).json({
        message: "scheduleId, busId, seatNumber are required",
      });
    }

    // 🔹 Check if schedule exists
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();
    if (!scheduleDoc.exists) {
      return res.status(400).json({ message: "Schedule does not exist" });
    }

    // 🔹 Prevent double booking (CRITICAL)
    const existing = await db
      .collection("bookings")
      .where("scheduleId", "==", scheduleId)
      .where("seatNumber", "==", seatNumber)
      .where("status", "==", "Confirmed")
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        message: "Seat already booked for this schedule",
      });
    }

    // 🔹 Create booking
    const bookingRef = db.collection("bookings").doc();

    await bookingRef.set({
      bookingId: bookingRef.id,
      userId,
      scheduleId,
      busId,
      seatNumber,
      status: "Confirmed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Booking successful",
      bookingId: bookingRef.id,
    });

  } catch (error) {
    console.error("Create Booking Error:", error);
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

    const snapshot = await db
      .collection("bookings")
      .where("scheduleId", "==", scheduleId)
      .where("status", "==", "Confirmed")
      .get();

    const bookedSeats = snapshot.docs.map((doc) => doc.data().seatNumber);

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
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingDoc.data();

    // 🔒 Ensure user owns booking
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await bookingRef.update({
      status: "Cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Booking cancelled successfully" });

  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};