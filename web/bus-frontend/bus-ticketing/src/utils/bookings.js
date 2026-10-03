const BOOKING_API = "/api/booking/my";
const VISIBLE_BOOKING_STATUSES = new Set(["CONFIRMED", "BOOKED", "PENDING_PAYMENT", "CHECKOUT_CREATED"]);

export function getTripTiming(booking, route) {
  const date = booking.date || route?.date;
  const departureTime = booking.departureTime || route?.startTime;
  const departureAt = date && departureTime ? new Date(`${date}T${departureTime}`) : null;
  if (!departureAt || Number.isNaN(departureAt.getTime())) return { departureAt: null, arrivalAt: null };

  const durationMatch = String(route?.duration || "").match(/^(\d+):([0-5]?\d)$/);
  let durationMinutes = durationMatch
    ? Number(durationMatch[1]) * 60 + Number(durationMatch[2])
    : null;

  if (durationMinutes === null && route?.startTime && route?.endTime) {
    const [startHours, startMinutes] = route.startTime.split(":").map(Number);
    const [endHours, endMinutes] = route.endTime.split(":").map(Number);
    if ([startHours, startMinutes, endHours, endMinutes].every(Number.isFinite)) {
      durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
      if (durationMinutes < 0) durationMinutes += 24 * 60;
    }
  }

  const arrivalAt = durationMinutes === null
    ? null
    : new Date(departureAt.getTime() + durationMinutes * 60_000);
  return { departureAt, arrivalAt };
}

export function getTripTimingStatus(booking, route, now = new Date()) {
  const { departureAt, arrivalAt } = getTripTiming(booking, route);
  if (!departureAt || departureAt > now) return "upcoming";
  return arrivalAt && arrivalAt > now ? "on_the_way" : "expired";
}

export async function fetchPassengerBookings(token) {
  const response = await fetch(BOOKING_API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not load your bookings");

  return data
    .filter((booking) => {
      const status = String(booking.status || "").toUpperCase();
      if (["CANCELLED", "CANCELED", "RELEASED"].includes(status)) return false;
      return VISIBLE_BOOKING_STATUSES.has(status)
        || String(booking.paymentStatus || "").toUpperCase() === "SUCCEEDED";
    })
    .map((booking) => {
      const status = String(booking.status || "").toUpperCase();
      return {
        ...booking,
        bookingId: booking.bookingId || booking.id,
        seat: booking.seat || booking.seatNumber || booking.seatNo,
        bookingDate: booking.bookingDate || booking.createdAt || null,
        paymentStatus: booking.paymentStatus || (status === "CONFIRMED" || status === "BOOKED" ? "SUCCEEDED" : undefined),
      };
    });
}

export async function cancelPassengerBooking(token, bookingId) {
  const response = await fetch(`/api/booking/cancel/${encodeURIComponent(bookingId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not cancel this booking");
  return data;
}