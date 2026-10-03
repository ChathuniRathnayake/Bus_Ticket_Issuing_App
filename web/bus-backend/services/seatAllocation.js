import { createHash } from "node:crypto";
import { admin, db } from "../config/firebase.js";
import { ACTIVE_TICKET_STATUSES, isSeatRecordForSchedule, journeySegmentsOverlap, validateJourneySegment } from "./journeySegments.js";

export { ACTIVE_TICKET_STATUSES, journeySegmentsOverlap, validateJourneySegment };

const cancelledLegacyStatuses = new Set(["CANCELLED", "Cancelled", "RELEASED"]);

function lockId(scheduleId, busId, seatNo, stopId) {
	return createHash("sha256").update(`${scheduleId}|${busId}|${seatNo}|${stopId}`).digest("hex");
}

export function isLegacySeatActive(status) {
	return !cancelledLegacyStatuses.has(status);
}

export async function expireStalePaymentReservations(scheduleId, busId, seatNo) {
	const reservationMs = Number(process.env.PAYMENT_RESERVATION_MINUTES || 30) * 60_000;
	const snapshot = await db.collection("tickets")
		.where("scheduleId", "==", scheduleId)
		.where("busId", "==", busId)
		.where("status", "==", "PENDING_PAYMENT")
		.get();

	for (const ticketSnapshot of snapshot.docs) {
		const data = ticketSnapshot.data();
		if (seatNo !== undefined && String(data.seatNo) !== String(seatNo)) continue;
		const createdAt = data.createdAt?.toDate?.().getTime() || 0;
		const expiresAt = data.expiresAt?.toDate?.().getTime() || createdAt + reservationMs;
		if (expiresAt > Date.now()) continue;

		const bookingRef = db.collection("bookings").doc(data.bookingId || ticketSnapshot.id);
		const ticketRef = ticketSnapshot.ref;
		const lockQuery = db.collection("seatLocks").where("ticketId", "==", ticketSnapshot.id);
		const paymentQuery = db.collection("payments").where("bookingId", "==", bookingRef.id);
		await db.runTransaction(async (transaction) => {
			const [ticket, booking, locks, payments] = await Promise.all([
				transaction.get(ticketRef), transaction.get(bookingRef), transaction.get(lockQuery), transaction.get(paymentQuery),
			]);
			if (!ticket.exists || ticket.data().status !== "PENDING_PAYMENT") return;
			transaction.update(ticketRef, { status: "AVAILABLE", releasedAt: admin.firestore.FieldValue.serverTimestamp(), releaseReason: "reservation_expired" });
			if (booking.exists && ["PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(booking.data().status)) {
				transaction.update(bookingRef, { status: "PAYMENT_FAILED", releasedAt: admin.firestore.FieldValue.serverTimestamp(), releaseReason: "reservation_expired" });
			}
			locks.docs.forEach((doc) => transaction.update(doc.ref, { status: "RELEASED", releasedAt: admin.firestore.FieldValue.serverTimestamp() }));
			payments.docs.forEach((doc) => {
				if (["PENDING", "CHECKOUT_CREATED"].includes(doc.data().status)) {
					transaction.update(doc.ref, { status: "EXPIRED", expiredAt: admin.firestore.FieldValue.serverTimestamp() });
				}
			});
		});
	}
}

export async function allocateSeatInTransaction(transaction, input) {
	const {
		scheduleId, busId, seatNumber, boardingStopId, dropStopId, userId,
		bookingRef, ticketRef, paymentRef, paymentData,
		bookingStatus = "CONFIRMED", ticketStatus = "BOOKED", passengerDetails = {},
	} = input;
	const seatNo = String(seatNumber);
	const scheduleRef = db.collection("schedules").doc(scheduleId);
	const busRef = db.collection("buses").doc(busId);
	const scheduleDoc = await transaction.get(scheduleRef);
	const busDoc = await transaction.get(busRef);
	if (!scheduleDoc.exists) throw new Error("Schedule not found");
	if (!busDoc.exists) throw new Error("Bus not found");
	const schedule = scheduleDoc.data();
	if (schedule.busId !== busId) throw new Error("Bus does not match schedule");
	if (schedule.status && schedule.status !== "Active") throw new Error("Schedule is not active");

	const routeDoc = await transaction.get(db.collection("routes").doc(schedule.routeId));
	if (!routeDoc.exists) throw new Error("Route not found");
	const segment = validateJourneySegment(routeDoc.data(), boardingStopId, dropStopId);

	const ticketQuery = db.collection("tickets").where("busId", "==", busId);
	const legacyQuery = db.collection("seats").where("busId", "==", busId);
	const ticketSnapshot = await transaction.get(ticketQuery);
	const legacySnapshot = await transaction.get(legacyQuery);
	const lockRefs = segment.segmentStopIds.map((stopId) => db.collection("seatLocks").doc(lockId(scheduleId, busId, seatNo, stopId)));
	const lockSnapshots = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));

	const ticketConflict = ticketSnapshot.docs.some((doc) => {
		const ticket = doc.data();
		return isSeatRecordForSchedule(ticket, scheduleId, seatNo)
			&& ACTIVE_TICKET_STATUSES.has(ticket.status)
			&& journeySegmentsOverlap(segment, ticket);
	});
	const legacyConflict = legacySnapshot.docs.some((doc) => {
		const legacySeat = doc.data();
		return isSeatRecordForSchedule(legacySeat, scheduleId, seatNo) && isLegacySeatActive(legacySeat.status);
	});
	const lockConflict = lockSnapshots.some((doc) => doc.exists && ["ACTIVE", "PENDING"].includes(doc.data().status));
	if (ticketConflict || legacyConflict || lockConflict) throw new Error("SEAT_UNAVAILABLE");

	const timestamp = admin.firestore.FieldValue.serverTimestamp();
	const common = {
		bookingId: bookingRef.id,
		userId,
		scheduleId,
		busId,
		routeId: schedule.routeId,
		seatNo,
		seatNumber: seatNo,
		boardingStopId,
		boardingStop: segment.boardingStop.name,
		boardingStopIndex: segment.boardingIndex,
		dropStopId,
		dropStop: segment.dropStop.name,
		dropStopIndex: segment.dropIndex,
		segmentStopIds: segment.segmentStopIds,
		createdAt: timestamp,
		...passengerDetails,
	};
	transaction.set(bookingRef, { ...common, status: bookingStatus });
	transaction.set(ticketRef, { ...common, ticketId: ticketRef.id, status: ticketStatus });
	if (paymentRef && paymentData) transaction.set(paymentRef, paymentData);
	lockRefs.forEach((ref, index) => transaction.set(ref, {
		scheduleId,
		busId,
		seatNo,
		segmentStopId: segment.segmentStopIds[index],
		ticketId: ticketRef.id,
		status: ticketStatus === "PENDING_PAYMENT" ? "PENDING" : "ACTIVE",
		createdAt: timestamp,
	}));
	return { schedule, route: routeDoc.data(), segment };
}

export async function setTicketLocksStatus(transaction, ticketId, status) {
	const locks = await transaction.get(db.collection("seatLocks").where("ticketId", "==", ticketId));
	locks.docs.forEach((doc) => transaction.update(doc.ref, {
		status,
		...(status === "ACTIVE" ? { activatedAt: admin.firestore.FieldValue.serverTimestamp() } : { releasedAt: admin.firestore.FieldValue.serverTimestamp() }),
	}));
}
