import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";

const formatFare = (priceCents) => {
  const cents = Number(priceCents);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return `Rs ${(cents / 100).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Single seat button ────────────────────────────────────────────────────────
function SeatBtn({ label, status, onClick }) {
  const isBooked   = status === "booked";
  const isSelected = status === "selected";

  let colorClass;
  if (isBooked)
    colorClass = "bg-red-100 border-red-400 text-red-500 cursor-not-allowed opacity-75";
  else if (isSelected)
    colorClass = "bg-blue-100 border-blue-500 text-blue-700 scale-105 shadow-lg";
  else
    colorClass =
      "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-200 hover:scale-105 cursor-pointer active:scale-95";

  return (
    <button
      onClick={() => !isBooked && onClick(label)}
      disabled={isBooked}
      title={label}
      className={`relative w-11 h-12 rounded-t-2xl rounded-b-md border-2 flex flex-col items-center justify-end pb-1 text-[10px] font-bold shadow-sm transition-all duration-200 select-none ${colorClass}`}
    >
      {/* headrest */}
      <span className={`absolute top-1 left-1 right-1 h-4 rounded-t-xl ${isBooked ? "bg-red-200" : isSelected ? "bg-blue-200" : "bg-emerald-200"}`} />
      <span className="relative z-10 leading-none">{label}</span>
    </button>
  );
}

function normalizeRouteStops(bus) {
  const routeStops = bus?.route?.stops;
  if (Array.isArray(routeStops) && routeStops.length >= 2) {
    return routeStops.map((stop, sequence) => typeof stop === "string"
      ? { stopId: `${bus.routeId}-${sequence}`, name: stop, sequence, boardingAllowed: sequence === 0, alightingAllowed: sequence === routeStops.length - 1 }
      : { ...stop, sequence: Number.isInteger(stop.sequence) ? stop.sequence : sequence });
  }
  return [
    { stopId: `${bus?.routeId}-origin`, name: bus?.route?.startStop || bus?.routeId || "Origin", sequence: 0, boardingAllowed: true, alightingAllowed: false },
    { stopId: `${bus?.routeId}-destination`, name: bus?.route?.endStop || "Destination", sequence: 1, boardingAllowed: false, alightingAllowed: true },
  ];
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SeatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bus } = location.state || {};
  const [routeStops] = useState(() => normalizeRouteStops(bus));
  const [boardingStopId, setBoardingStopId] = useState(() => (
    bus?.boardingStop?.stopId
      || normalizeRouteStops(bus)[0]?.stopId
      || ""
  ));
  const [dropStopId, setDropStopId] = useState(() => (
    bus?.dropStop?.stopId
      || normalizeRouteStops(bus).at(-1)?.stopId
      || ""
  ));

  const leftSeatsPerRow  = parseInt(bus?.leftColumns)  || 2;
  const rightSeatsPerRow = parseInt(bus?.rightColumns) || 2;
  const leftRows         = parseInt(bus?.leftRows)     || 10;
  const rightRows        = parseInt(bus?.rightRows)    || 10;
  const backRowSeats     = parseInt(bus?.backRowSeats) || 5;
  const hasFrontSingle =
    bus?.hasFrontSingle === "yes" || bus?.hasFrontSingle === true;
  const hasBackFullRow =
    bus?.hasBackFullRow === "yes" || bus?.hasBackFullRow === true;

  // ── Seat state ───────────────────────────────────────────────────────────────
  const [bookedSeats, setBookedSeats]   = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!bus?.scheduleId || !(bus.id || bus.busId) || !boardingStopId || !dropStopId) {
      setLoadingSeats(false);
      return undefined;
    }
    const fetchBookedSeats = async () => {
      try {
        const token = localStorage.getItem("token");
        const busId = bus.id || bus.busId;
        const query = new URLSearchParams({ scheduleId: bus.scheduleId, busId, boardingStopId, dropStopId });
        const res = await fetch(`http://localhost:5000/api/ticket/availability?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load booked seats");
        setBookedSeats(data.occupiedSeats.map(String));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchBookedSeats();
    const interval = window.setInterval(fetchBookedSeats, 5000);
    return () => window.clearInterval(interval);
  }, [bus, boardingStopId, dropStopId]);

  // ── Seat number helpers ───────────────────────────────────────────────────────
  // Seats are numbered sequentially left-to-right across the full row, top-to-bottom.
  // F1 (conductor) is seat "C" (a special label kept separate).
  // Back seats follow the last main-row seat number.

  const seatsPerRow = leftSeatsPerRow + rightSeatsPerRow;

  /**
   * Returns the numeric seat label (as a string) for a given row and column index.
   * colIndex: 0-based across the full row (left cols first, then right cols).
   */
  const getSeatNumber = (rowIdx, colIndex) => {
    return String(rowIdx * seatsPerRow + colIndex + 1);
  };

  /**
   * Returns the numeric label for a back-row seat.
   * Back seats continue after the last numbered main seat.
   */
  const getBackSeatNumber = (backColIndex) => {
    const mainRows = Math.max(leftRows, rightRows);
    const lastMainSeat = mainRows * seatsPerRow;
    return String(lastMainSeat + backColIndex + 1);
  };

  // Conductor seat label
  const conductorSeatLabel = "C";

  // ── Seat status ───────────────────────────────────────────────────────────────
  const seatStatus = (seat) => {
    if (bookedSeats.includes(seat)) return "booked";
    if (selectedSeat === seat)      return "selected";
    return "available";
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat((prev) => (prev === seat ? null : seat));
  };

  const confirmBooking = async () => {
    if (!selectedSeat || !bus.scheduleId || !boardingStopId || !dropStopId) {
      setCheckoutError("Choose an authorized boarding point and destination first.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/payments/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleId: bus.scheduleId,
          busId: bus.id || bus.busId,
          seatNumber: selectedSeat,
          boardingStopId,
          dropStopId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not start payment");
      if (!data.checkoutUrl || !data.paymentId) throw new Error("Payment service returned an incomplete checkout session");

      localStorage.setItem("pendingPayment", JSON.stringify({
        paymentId: data.paymentId,
        bookingId: data.bookingId,
        amountCents: data.amountCents,
        currency: data.currency,
        busId: bus.id || bus.busId,
        busNo: bus.busNo,
        routeId: bus.routeId,
        startStop: bus.route?.startStop,
        endStop: bus.route?.endStop,
        scheduleId: bus.scheduleId,
        date: bus.tripDate,
        departureTime: bus.departureTime,
        seat: selectedSeat,
        boardingStopId,
        boardingStop: routeStops.find((stop) => stop.stopId === boardingStopId)?.name,
        dropStopId,
        dropStop: routeStops.find((stop) => stop.stopId === dropStopId)?.name,
        expiresAt: data.expiresAt,
      }));
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setCheckoutError(err.message || "Unable to start payment. Please try again.");
      setCheckoutLoading(false);
    }
  };

  if (!bus) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No bus selected.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const lastStopSequence = Math.max(...routeStops.map((stop) => stop.sequence));
  const boardingStops = routeStops.filter((stop) => stop.sequence < lastStopSequence);
  const selectedBoarding = routeStops.find((stop) => stop.stopId === boardingStopId);
  const destinationStops = routeStops.filter((stop) => stop.sequence > (selectedBoarding?.sequence ?? -1));

  const bookedSeatSet = new Set(bookedSeats);
  const layoutSeatNumbers = [
    ...(hasFrontSingle ? [conductorSeatLabel] : []),
    ...Array.from({ length: leftRows }, (_, rowIdx) =>
      Array.from({ length: leftSeatsPerRow }, (_, col) => getSeatNumber(rowIdx, col)),
    ).flat(),
    ...Array.from({ length: rightRows }, (_, rowIdx) =>
      Array.from({ length: rightSeatsPerRow }, (_, col) => getSeatNumber(rowIdx, leftSeatsPerRow + col)),
    ).flat(),
    ...(hasBackFullRow
      ? Array.from({ length: backRowSeats }, (_, col) => getBackSeatNumber(col))
      : []),
  ];
  const bookedCount = layoutSeatNumbers.filter((seat) => bookedSeatSet.has(seat)).length;
  const availableCount = layoutSeatNumbers.length - bookedCount;
  const maxRows        = Math.max(leftRows, rightRows);
  const fareLabel      = formatFare(bus.route?.priceCents ?? bus.priceCents);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="h-10 gap-2 hover:bg-muted cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> Back to Buses
        </Button>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Seat Layout — {bus.busNo}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Route: {bus.routeId} &nbsp;·&nbsp; Total seats: {layoutSeatNumbers.length}
          </p>
        </div>
      </div>

      {loadingSeats && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-6 py-4 text-sm text-blue-700">
          <div className="h-4 w-4 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin shrink-0" />
          Loading current seat reservations for this bus...
        </div>
      )}

      <Card className="mb-5 border border-slate-200 shadow-md rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            📍 Boarding point
            <select
              value={boardingStopId}
              onChange={(event) => {
                const nextId = event.target.value;
                const nextStop = routeStops.find((stop) => stop.stopId === nextId);
                setBoardingStopId(nextId);
                if ((routeStops.find((stop) => stop.stopId === dropStopId)?.sequence ?? -1) <= (nextStop?.sequence ?? -1)) {
                  setDropStopId(routeStops.find((stop) => stop.sequence > nextStop.sequence)?.stopId || "");
                }
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {boardingStops.map((stop) => <option key={stop.stopId} value={stop.stopId}>{stop.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            🏁 Destination point
            <select
              value={dropStopId}
              onChange={(event) => setDropStopId(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {destinationStops.map((stop) => <option key={stop.stopId} value={stop.stopId}>{stop.name}</option>)}
            </select>
          </label>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
          Available: {availableCount}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
          Booked: {bookedCount}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
          <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
          Selected: {selectedSeat ?? "None"}
        </div>
      </div>

      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6">

          {/* ════════════════ BUS SHELL ════════════════ */}
          <div className="border-4 border-gray-300 rounded-3xl bg-gray-50 px-6 pt-4 pb-6 overflow-x-auto">

            {/* ── FRONT ROW: Driver + (optional) Conductor seat ── */}
            <div className="flex items-end justify-between pb-4 mb-4 border-b-2 border-dashed border-gray-300">

              {/* Driver */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Driver</span>
                <div className="w-11 h-12 rounded-t-2xl rounded-b-md border-2 border-gray-400 bg-gray-200 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9"/>
                    <circle cx="12" cy="12" r="3"/>
                    <line x1="12" y1="3"  x2="12" y2="9"/>
                    <line x1="12" y1="15" x2="12" y2="21"/>
                    <line x1="3"  y1="12" x2="9"  y2="12"/>
                    <line x1="15" y1="12" x2="21" y2="12"/>
                  </svg>
                </div>
              </div>

              {/* Center label */}
              <span className="text-xs text-gray-400 font-medium tracking-widest uppercase self-center">
                ——— FRONT ———
              </span>

              {/* Conductor seat */}
              <div className="flex flex-col items-center gap-1 min-w-[44px]">
                {hasFrontSingle ? (
                  <>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Conductor</span>
                    {/* Label "C" for conductor; seatNo sent to backend is also "C" */}
                    <SeatBtn
                      label={conductorSeatLabel}
                      status={seatStatus(conductorSeatLabel)}
                      onClick={handleSeatClick}
                    />
                  </>
                ) : (
                  <div className="w-11 h-12 opacity-0" />
                )}
              </div>
            </div>

            {/* ── MIDDLE: Left | Aisle | Right ── */}
            <div className="flex gap-0 justify-center min-w-max mx-auto">

              {/* LEFT */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 tracking-widest mb-2 uppercase">
                  Left ({leftSeatsPerRow}/row × {leftRows} rows)
                </span>
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: maxRows }).map((_, rowIdx) => (
                    <div key={`L${rowIdx}`} className="flex gap-1">
                      {rowIdx < leftRows
                        ? Array.from({ length: leftSeatsPerRow }).map((_, col) => {
                            // colIndex 0-based across full row for left side: 0, 1, …
                            const seat = getSeatNumber(rowIdx, col);
                            return (
                              <SeatBtn
                                key={seat}
                                label={seat}
                                status={seatStatus(seat)}
                                onClick={handleSeatClick}
                              />
                            );
                          })
                        : Array.from({ length: leftSeatsPerRow }).map((_, col) => (
                            <div key={`gl${rowIdx}${col}`} className="w-11 h-12" />
                          ))
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* AISLE */}
              <div className="flex items-center justify-center w-14 mx-2">
                <span
                  className="text-[9px] font-semibold text-gray-300 tracking-[0.35em] uppercase"
                  style={{ writingMode: "vertical-rl" }}
                >
                  AISLE
                </span>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 tracking-widest mb-2 uppercase">
                  Right ({rightSeatsPerRow}/row × {rightRows} rows)
                </span>
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: maxRows }).map((_, rowIdx) => (
                    <div key={`R${rowIdx}`} className="flex gap-1">
                      {rowIdx < rightRows
                        ? Array.from({ length: rightSeatsPerRow }).map((_, col) => {
                            // colIndex continues after left seats: leftSeatsPerRow, leftSeatsPerRow+1, …
                            const seat = getSeatNumber(rowIdx, leftSeatsPerRow + col);
                            return (
                              <SeatBtn
                                key={seat}
                                label={seat}
                                status={seatStatus(seat)}
                                onClick={handleSeatClick}
                              />
                            );
                          })
                        : Array.from({ length: rightSeatsPerRow }).map((_, col) => (
                            <div key={`gr${rowIdx}${col}`} className="w-11 h-12" />
                          ))
                      }
                    </div>
                  ))}
                </div>
              </div>

            </div>{/* end middle */}

            {/* ── BACK ROW ── */}
            {hasBackFullRow && (
              <div className="mt-5 pt-4 border-t-2 border-dashed border-gray-300">
                <p className="text-[10px] text-gray-400 font-semibold tracking-widest text-center mb-3 uppercase">
                  Back Row — {backRowSeats} seats
                </p>
                <div className="flex justify-center gap-1 flex-wrap">
                  {Array.from({ length: backRowSeats }).map((_, col) => {
                    const seat = getBackSeatNumber(col);
                    return (
                      <SeatBtn
                        key={seat}
                        label={seat}
                        status={seatStatus(seat)}
                        onClick={handleSeatClick}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rear label */}
            <p className="text-center mt-4 text-xs text-gray-400 font-medium tracking-widest uppercase">
              ——— REAR ———
            </p>

          </div>{/* end bus shell */}

          {/* ── Action bar ── */}
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              {selectedSeat
                ? <>Selected: <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">Seat {selectedSeat}</span></>
                : "Click an available seat to select it"}
            </p>
            <Button
              disabled={!selectedSeat}
              onClick={() => setShowConfirm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-5 text-base font-semibold disabled:opacity-40 cursor-pointer"
            >
              {selectedSeat ? `Book Seat ${selectedSeat}` : "Select a Seat"}
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* ── Confirmation modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <Card className="w-full max-w-sm mx-4 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pb-4 pt-5 px-6">
              <CardTitle className="text-xl text-center">Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-16 rounded-t-2xl rounded-b-md border-2 border-blue-400 bg-blue-50 mx-auto flex items-center justify-center relative">
                  <span className="absolute top-1 left-1 right-1 h-4 rounded-t-xl bg-blue-200" />
                  <span className="relative z-10 text-blue-700 font-bold text-xs">{selectedSeat}</span>
                </div>
                <p className="text-lg font-semibold">
                  Continue with seat <strong className="text-blue-700">{selectedSeat}</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  {bus.busNo} &nbsp;|&nbsp; {bus.route?.startStop} to {bus.route?.endStop}
                </p>
                {fareLabel && (
                  <p className="text-2xl font-bold text-emerald-600">{fareLabel}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {fareLabel
                    ? "Your seat is reserved while you complete secure checkout at this fare."
                    : "Your seat is reserved while you complete secure checkout. The confirmed fare is shown by Stripe."}
                </p>
              </div>
              {checkoutError && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {checkoutError}
                </p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={checkoutLoading} className="flex-1 h-11 cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={confirmBooking} disabled={checkoutLoading} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {checkoutLoading ? "Opening checkout..." : "Pay securely"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}