const BOOKING_API = "/api/booking/my";
const VISIBLE_BOOKING_STATUSES = new Set(["CONFIRMED", "BOOKED", "PENDING_PAYMENT", "CHECKOUT_CREATED"]);

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