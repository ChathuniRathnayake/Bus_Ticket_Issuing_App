import { db } from "../config/firebase.js";

export const createTicket = async (req, res) => {
  try {
    const { busId, seatNo, routeId } = req.body;

    const userId = req.user.uid; // from verifyToken

    if (!busId || !seatNo) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔒 Prevent double booking
    const existing = await db
      .collection("tickets")
      .where("busId", "==", busId)
      .where("seatNo", "==", seatNo)
      .where("status", "==", "booked")
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // ✅ Save ticket
    const docRef = await db.collection("tickets").add({
      busId,
      seatNo,
      routeId,
      userId,
      status: "booked",
      createdAt: new Date(),
    });

    res.json({ message: "Seat booked successfully", bookingId: docRef.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      .where("status", "==", "booked")
      .get();

    const tickets = ticketsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      .where("status", "==", "booked")
      .get();

    const tickets = ticketsSnap.docs.map((doc) => ({ bookingId: doc.id, ...doc.data() }));
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};