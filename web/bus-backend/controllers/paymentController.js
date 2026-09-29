import "dotenv/config";
import Stripe from "stripe";
import QRCode from "qrcode";
import { admin, db } from "../config/firebase.js";
import { allocateSeatInTransaction, expireStalePaymentReservations, setTicketLocksStatus } from "../services/seatAllocation.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const reservationMinutes = Number(process.env.PAYMENT_RESERVATION_MINUTES || 30);
const configuredPriceCents = Number(process.env.TICKET_PRICE_CENTS || 45000);
const currency = (process.env.STRIPE_CURRENCY || "lkr").toLowerCase();

const serverError = (res, error) => {
  console.error("Payment error:", error);
  return res.status(500).json({ message: "Payment service error" });
};

const getTicketPriceCents = (schedule, route) => {
  const candidate = [
    schedule?.priceCents, schedule?.amountCents, schedule?.fareCents,
    route?.priceCents, route?.amountCents, route?.fareCents,
  ].find((value) => Number.isInteger(Number(value)) && Number(value) > 0);
  return candidate ? Number(candidate) : configuredPriceCents;
};

export const createCheckoutSession = async (req, res) => {
  if (!stripe || !stripeSecretKey) return res.status(503).json({ message: "Stripe is not configured" });
  const { scheduleId, busId, seatNumber, boardingStopId, dropStopId, amountCents } = req.body;
  const userId = req.user.uid;
  if (!scheduleId || !busId || !seatNumber || !boardingStopId || !dropStopId) {
    return res.status(400).json({ message: "scheduleId, busId, seatNumber, boardingStopId and dropStopId are required" });
  }

  try {
    const scheduleRef = db.collection("schedules").doc(scheduleId);
    const bookingRef = db.collection("bookings").doc();
    const paymentRef = db.collection("payments").doc();
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + reservationMinutes * 60 * 1000);
    const scheduleDoc = await scheduleRef.get();
    if (!scheduleDoc.exists) return res.status(404).json({ message: "Schedule not found" });
    const schedule = scheduleDoc.data();
    if (schedule.busId !== busId) return res.status(400).json({ message: "Bus does not match schedule" });
    let route = null;
    if (schedule.routeId) {
      const routeDoc = await db.collection("routes").doc(schedule.routeId).get();
      if (routeDoc.exists) route = routeDoc.data();
    }
    const priceCents = getTicketPriceCents(schedule, route);
    if (amountCents !== undefined && Number(amountCents) !== priceCents) {
      return res.status(400).json({ message: "Ticket amount is invalid" });
    }

    await expireStalePaymentReservations(scheduleId, busId, String(seatNumber));
    await db.runTransaction(async (transaction) => allocateSeatInTransaction(transaction, {
      scheduleId,
      busId,
      seatNumber,
      boardingStopId,
      dropStopId,
      userId,
      bookingRef,
      ticketRef: db.collection("tickets").doc(bookingRef.id),
      paymentRef,
      paymentData: {
        paymentId: paymentRef.id,
        bookingId: bookingRef.id,
        userId,
        amountCents: priceCents,
        currency,
        status: "PENDING",
        createdAt: now,
      },
      bookingStatus: "PENDING_PAYMENT",
      ticketStatus: "PENDING_PAYMENT",
      passengerDetails: { amountCents: priceCents, currency, expiresAt },
    }));

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price_data: {
          currency, product_data: { name: `Bus ticket - seat ${seatNumber}` }, unit_amount: priceCents,
        }, quantity: 1 }],
        customer_email: req.user.email,
        success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:5173/payment-cancelled",
        metadata: { bookingId: bookingRef.id, paymentId: paymentRef.id, userId, scheduleId, busId, seatNumber: String(seatNumber), boardingStopId, dropStopId },
        expires_at: Math.floor(expiresAt.toMillis() / 1000),
      }, { idempotencyKey: `checkout-${bookingRef.id}` });
    } catch (error) {
      await releaseReservation(bookingRef.id, "checkout_creation_failed");
      return serverError(res, error);
    }
    await Promise.all([
      paymentRef.update({ stripeSessionId: session.id, status: "CHECKOUT_CREATED" }),
      bookingRef.update({ stripeSessionId: session.id }),
    ]);
    return res.status(201).json({
      paymentId: paymentRef.id,
      bookingId: bookingRef.id,
      checkoutUrl: session.url,
      amountCents: priceCents,
      currency,
      expiresAt: expiresAt.toDate().toISOString(),
    });
  } catch (error) {
    if (error.message === "SEAT_UNAVAILABLE") return res.status(409).json({ message: "Seat is already reserved or booked" });
    if (["Schedule not found", "Bus not found", "Bus does not match schedule", "Route not found"].includes(error.message)
      || /stop|Destination|Boarding|Alighting|active/i.test(error.message)) return res.status(400).json({ message: error.message });
    return serverError(res, error);
  }
};

const releaseReservation = async (bookingId, reason) => {
  await db.runTransaction(async (transaction) => {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await transaction.get(bookingRef);
    if (!bookingDoc.exists) return;
    const booking = bookingDoc.data();
    if (!["PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(booking.status)) return;
    const ticketRef = db.collection("tickets").doc(bookingId);
    await setTicketLocksStatus(transaction, ticketRef.id, "RELEASED");
    transaction.update(bookingRef, { status: "PAYMENT_FAILED", releasedAt: admin.firestore.FieldValue.serverTimestamp(), releaseReason: reason });
    transaction.update(ticketRef, { status: "AVAILABLE", releasedAt: admin.firestore.FieldValue.serverTimestamp(), releaseReason: reason });
  });
};

export const cancelPayment = async (req, res) => {
  try {
    const paymentRef = db.collection("payments").doc(req.params.paymentId);
    const paymentDoc = await paymentRef.get();
    if (!paymentDoc.exists) return res.status(404).json({ message: "Payment not found" });
    const payment = paymentDoc.data();
    if (payment.userId !== req.user.uid) return res.status(403).json({ message: "Not authorized" });
    if (!["PENDING", "CHECKOUT_CREATED"].includes(payment.status)) {
      return res.status(409).json({ message: "Payment can no longer be cancelled" });
    }
    if (payment.stripeSessionId && stripe) {
      const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
      if (session.status === "open") await stripe.checkout.sessions.expire(payment.stripeSessionId);
    }
    await paymentRef.update({ status: "CANCELLED", cancelledAt: admin.firestore.FieldValue.serverTimestamp() });
    await releaseReservation(payment.bookingId, "cancelled_by_user");
    return res.json({ message: "Payment cancelled and seat released" });
  } catch (error) { return serverError(res, error); }
};

const finalizePayment = async (session, eventId) => {
  const bookingId = session.metadata?.bookingId;
  const paymentId = session.metadata?.paymentId;
  if (!bookingId || !paymentId || session.payment_status !== "paid") return;
  const eventRef = db.collection("stripeWebhookEvents").doc(eventId);
  const bookingRef = db.collection("bookings").doc(bookingId);
  const paymentRef = db.collection("payments").doc(paymentId);
  const ticketRef = db.collection("tickets").doc(bookingId);
  const qrPayload = JSON.stringify({ bookingId, busId: session.metadata.busId, seat: session.metadata.seatNumber });
  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
  await db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists) return;
    const bookingDoc = await transaction.get(bookingRef);
    const paymentDoc = await transaction.get(paymentRef);
    const ticketDoc = await transaction.get(ticketRef);
    await setTicketLocksStatus(transaction, ticketRef.id, "ACTIVE");
    if (!bookingDoc.exists || !paymentDoc.exists || !ticketDoc.exists) throw new Error("Payment records not found");
    if (bookingDoc.data().status === "CONFIRMED") {
      transaction.create(eventRef, { eventId, type: "checkout.session.completed", processedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }
    transaction.update(paymentRef, { status: "SUCCEEDED", stripePaymentIntentId: session.payment_intent, paidAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.update(bookingRef, { status: "CONFIRMED", confirmedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.update(ticketRef, { status: "BOOKED", qrPayload, qrCodeDataUrl, bookedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(eventRef, { eventId, type: "checkout.session.completed", processedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
};

const handlePaymentFailure = async (session, eventId, status) => {
  const paymentId = session.metadata?.paymentId;
  if (!paymentId) return;
  const eventRef = db.collection("stripeWebhookEvents").doc(eventId);
  const paymentRef = db.collection("payments").doc(paymentId);
  const paymentDoc = await paymentRef.get();
  if (!paymentDoc.exists) return;
  await db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists) return;
    transaction.update(paymentRef, { status, failedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(eventRef, { eventId, type: status, processedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await releaseReservation(paymentDoc.data().bookingId, status.toLowerCase());
};

export const handleStripeWebhook = async (req, res) => {
  if (!stripe || !stripeWebhookSecret) return res.status(503).send("Stripe webhook is not configured");
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], stripeWebhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);
    return res.status(400).send("Invalid webhook signature");
  }
  try {
    if (event.type === "checkout.session.completed") await finalizePayment(event.data.object, event.id);
    if (event.type === "checkout.session.async_payment_succeeded") await finalizePayment(event.data.object, event.id);
    if (event.type === "checkout.session.expired") await handlePaymentFailure(event.data.object, event.id, "EXPIRED");
    if (event.type === "checkout.session.async_payment_failed") await handlePaymentFailure(event.data.object, event.id, "FAILED");
    return res.json({ received: true });
  } catch (error) { return serverError(res, error); }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const paymentDoc = await db.collection("payments").doc(req.params.paymentId).get();
    if (!paymentDoc.exists) return res.status(404).json({ message: "Payment not found" });
    let payment = paymentDoc.data();
    if (payment.userId !== req.user.uid) return res.status(403).json({ message: "Not authorized" });

    if (stripe && payment.stripeSessionId && !["SUCCEEDED", "FAILED", "EXPIRED", "CANCELLED"].includes(payment.status)) {
      const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
      if (session.payment_status === "paid") {
        await finalizePayment(session, `status-check-${session.id}`);
        const refreshedPaymentDoc = await db.collection("payments").doc(req.params.paymentId).get();
        payment = refreshedPaymentDoc.data();
      }
    }

    const bookingDoc = await db.collection("bookings").doc(payment.bookingId).get();
    return res.json({ paymentId: paymentDoc.id, ...payment, booking: bookingDoc.exists ? { id: bookingDoc.id, ...bookingDoc.data() } : null });
  } catch (error) { return serverError(res, error); }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const snapshot = await db.collection("payments").where("userId", "==", req.user.uid).get();
    return res.json(snapshot.docs.map((doc) => ({ paymentId: doc.id, ...doc.data() })));
  } catch (error) { return serverError(res, error); }
};