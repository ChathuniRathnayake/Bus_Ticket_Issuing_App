import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

// ─── Main component ────────────────────────────────────────────────────────────
export default function SeatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bus } = location.state || {};

  if (!bus) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No bus selected.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const leftSeatsPerRow  = parseInt(bus.leftColumns)  || 2;
  const rightSeatsPerRow = parseInt(bus.rightColumns) || 2;
  const leftRows         = parseInt(bus.leftRows)     || 10;
  const rightRows        = parseInt(bus.rightRows)    || 10;
  const backRowSeats     = parseInt(bus.backRowSeats) || 5;
  const totalSeats       = parseInt(bus.totalSeats)   || 52;

  const hasFrontSingle =
    bus.hasFrontSingle === "yes" || bus.hasFrontSingle === true;
  const hasBackFullRow =
    bus.hasBackFullRow === "yes" || bus.hasBackFullRow === true;

  // ── Seat state ───────────────────────────────────────────────────────────────
  const [bookedSeats, setBookedSeats]   = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [lastBooked, setLastBooked]     = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    if (!bus) return;
    const fetchBookedSeats = async () => {
      setLoadingSeats(true);
      try {
        const token = localStorage.getItem("token");
        const busId = bus.id || bus.busId;
        const res = await fetch(`http://localhost:5000/api/ticket/bus/${busId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load booked seats");
        setBookedSeats(data.map((ticket) => ticket.seatNo));
      } catch (error) {
        console.error(error);
        alert(error.message || "Error loading booked seats");
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchBookedSeats();
  }, [bus]);

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
    try {
      if (!selectedSeat) return;
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId: bus.id || bus.busId,
          seatNo: selectedSeat,
          routeId: bus.routeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      const bookingId = data.bookingId || `${bus.id || bus.busId}-${selectedSeat}-${Date.now()}`;
      const newBooking = {
        bookingId,
        busId: bus.id || bus.busId,
        busNo: bus.busNo,
        routeId: bus.routeId,
        seat: selectedSeat,
        bookingDate: new Date().toISOString(),
        status: "Confirmed",
      };

      const existingBookings = JSON.parse(localStorage.getItem("userBookings")) || [];
      localStorage.setItem("userBookings", JSON.stringify([newBooking, ...existingBookings]));

      setBookedSeats((prev) => [...prev, selectedSeat]);
      setLastBooked(selectedSeat);
      setSelectedSeat(null);
      setShowConfirm(false);
      navigate("/passenger-dashboard/my-bookings");
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Seat counts ───────────────────────────────────────────────────────────────
  const generatedTotal =
    leftRows  * leftSeatsPerRow +
    rightRows * rightSeatsPerRow +
    (hasFrontSingle ? 1 : 0) +
    (hasBackFullRow ? backRowSeats : 0);

  const availableCount = generatedTotal - bookedSeats.length;
  const maxRows        = Math.max(leftRows, rightRows);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="h-10 gap-2 hover:bg-muted cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> Back to Buses
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Seat Layout — {bus.busNo}</h2>
          <p className="text-sm text-muted-foreground">
            Route: {bus.routeId} &nbsp;|&nbsp; Total seats: {totalSeats}
          </p>
        </div>
      </div>

      {/* Success banner */}
      {lastBooked && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-medium">
          ✅ Seat <strong>{lastBooked}</strong> booked successfully!
        </div>
      )}

      {loadingSeats && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center text-slate-500">
          Loading current seat reservations for this bus...
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { color: "emerald", label: `Available: ${availableCount}` },
          { color: "red",     label: `Booked: ${bookedSeats.length}` },
          { color: "blue",    label: `Selected: ${selectedSeat ?? "None"}` },
        ].map(({ color, label }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${color}-50 border border-${color}-200 text-${color}-700 text-sm font-medium`}>
            <span className={`w-3 h-3 rounded-sm bg-${color}-400 inline-block`} />
            {label}
          </div>
        ))}
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
                  Book seat <strong className="text-blue-700">{selectedSeat}</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  Bus: {bus.busNo} &nbsp;|&nbsp; Route: {bus.routeId}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 h-11 cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={confirmBooking} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  Yes, Book It
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}