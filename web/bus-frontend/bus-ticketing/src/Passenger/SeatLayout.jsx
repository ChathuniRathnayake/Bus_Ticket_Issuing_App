import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SeatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bus } = location.state || {};

  if (!bus) {
    return (
      <div className="text-center py-20">
        No bus selected.{" "}
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Layout configuration from bus object
  const leftSeatsPerRow = parseInt(bus.leftColumns) || 2;
  const rightSeatsPerRow = parseInt(bus.rightColumns) || 2;
  const leftRows = parseInt(bus.leftRows) || 10;
  const rightRows = parseInt(bus.rightRows) || 10;
  const hasFrontSingle = bus.hasFrontSingle === "yes";
  const hasBackFullRow = bus.hasBackFullRow === "yes";
  const backRowSeats = parseInt(bus.backRowSeats) || 5;

  const totalSeats = parseInt(bus.totalSeats) || 52;

  // Booked seats state
  const [bookedSeats, setBookedSeats] = useState(["A1", "A2", "B5", "C3", "F8"]);

  // Confirmation popup
  const [confirmAction, setConfirmAction] = useState(null);

  const toggleSeat = (seat) => {
    const isBooked = bookedSeats.includes(seat);
    setConfirmAction({ seat, action: isBooked ? "cancel" : "book" });
  };

  const confirmBooking = () => {
    if (confirmAction?.action === "book") {
      setBookedSeats((prev) => [...prev, confirmAction.seat]);
    } else if (confirmAction?.action === "cancel") {
      setBookedSeats((prev) => prev.filter(s => s !== confirmAction.seat));
    }
    setConfirmAction(null);
  };

  const cancelAction = () => setConfirmAction(null);

  const getSeatStatus = (seat) => (bookedSeats.includes(seat) ? "booked" : "available");

  // Generate all seats
  const generateSeats = () => {
    const seats = [];

    if (hasFrontSingle) {
      seats.push({ label: "F1", status: getSeatStatus("F1"), type: "front" });
    }

    const maxRows = Math.max(leftRows, rightRows);

    for (let r = 1; r <= maxRows; r++) {
      const rowLabel = String.fromCharCode(64 + r);

      // Left side
      if (r <= leftRows) {
        for (let c = 1; c <= leftSeatsPerRow; c++) {
          const seat = `${rowLabel}${c}`;
          seats.push({ label: seat, status: getSeatStatus(seat), side: "left" });
        }
      }

      // Right side
      if (r <= rightRows) {
        for (let c = 1; c <= rightSeatsPerRow; c++) {
          const seat = `${rowLabel}${leftSeatsPerRow + c}`;
          seats.push({ label: seat, status: getSeatStatus(seat), side: "right" });
        }
      }
    }

    if (hasBackFullRow) {
      for (let c = 1; c <= backRowSeats; c++) {
        const seat = `Back${c}`;
        seats.push({ label: seat, status: getSeatStatus(seat), type: "back" });
      }
    }

    return seats;
  };

  const allSeats = generateSeats();
  const availableCount = allSeats.filter(s => s.status === "available").length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Buses
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Seat Layout - {bus.busNo} ({bus.totalSeats} seats)
        </h2>
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>
            {bus.busNo} • Route: {bus.routeId} • {bus.totalSeats} Seats
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Legend */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Legend:</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-200 border border-green-500 rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-200 border border-red-500 rounded" />
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* Confirmation Popup */}
          {confirmAction && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
              <Card className="w-full max-w-sm mx-4 bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl">
                    {confirmAction.action === "book" ? "Book Seat" : "Cancel Booking"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-center text-lg font-medium">
                    {confirmAction.action === "book"
                      ? `Confirm booking seat ${confirmAction.seat}?`
                      : `Cancel booking for seat ${confirmAction.seat}?`}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={cancelAction} className="min-w-[100px]">
                      No
                    </Button>
                    <Button
                      onClick={confirmBooking}
                      className={`min-w-[100px] ${
                        confirmAction.action === "book" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Yes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Seat Grid */}
          <div className="max-w-5xl mx-auto mb-10">
            {/* Front single seat */}
            {bus.hasFrontSingle === "yes" && (
              <div className="mb-10 text-center">
                <button
                  onClick={() => toggleSeat("F1")}
                  disabled={getSeatStatus("F1") === "booked"}
                  className={`w-20 h-16 rounded-xl font-semibold text-base border-2 shadow transition-all duration-300 cursor-pointer
                    ${getSeatStatus("F1") === "available"
                      ? "bg-green-50 hover:bg-green-100 border-green-500 text-green-800"
                      : "bg-red-50 border-red-500 text-red-800 cursor-not-allowed"}`}
                >
                  F1 (Front)
                </button>
              </div>
            )}

            {/* Normal rows with labels and aisle */}
            <div className="flex justify-center gap-12">
              {/* LEFT SIDE */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">LEFT SIDE</h3>
                <div className="space-y-4">
                  {Array.from({ length: leftRows }).map((_, rowIndex) => {
                    const rowLabel = String.fromCharCode(65 + rowIndex);
                    return (
                      <div key={`left-${rowIndex}`} className="flex gap-2">
                        {Array.from({ length: leftSeatsPerRow }).map((_, col) => {
                          const seat = `${rowLabel}${col + 1}`;
                          const status = getSeatStatus(seat);
                          return (
                            <button
                              key={seat}
                              onClick={() => toggleSeat(seat)}
                              disabled={status === "booked"}
                              className={`w-14 h-14 rounded-xl font-semibold text-base border-2 shadow-sm transition-all duration-300 cursor-pointer
                                ${status === "available"
                                  ? "bg-green-50 hover:bg-green-100 border-green-500 text-green-800 hover:shadow-md"
                                  : "bg-red-50 border-red-500 text-red-800 cursor-not-allowed"}`}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AISLE */}
              <div className="flex flex-col justify-center">
                <div className="w-24 h-full flex items-center justify-center">
                  <span className="text-gray-400 font-medium text-sm rotate-90 tracking-widest">
                    AISLE
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">RIGHT SIDE</h3>
                <div className="space-y-4">
                  {Array.from({ length: rightRows }).map((_, rowIndex) => {
                    const rowLabel = String.fromCharCode(65 + rowIndex);
                    return (
                      <div key={`right-${rowIndex}`} className="flex gap-2">
                        {Array.from({ length: rightSeatsPerRow }).map((_, col) => {
                          const seat = `${rowLabel}${leftSeatsPerRow + col + 1}`;
                          const status = getSeatStatus(seat);
                          return (
                            <button
                              key={seat}
                              onClick={() => toggleSeat(seat)}
                              disabled={status === "booked"}
                              className={`w-14 h-14 rounded-xl font-semibold text-base border-2 shadow-sm transition-all duration-300 cursor-pointer
                                ${status === "available"
                                  ? "bg-green-50 hover:bg-green-100 border-green-500 text-green-800 hover:shadow-md"
                                  : "bg-red-50 border-red-500 text-red-800 cursor-not-allowed"}`}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Back row */}
            {bus.hasBackFullRow === "yes" && (
              <div className="mt-10">
                <p className="text-sm text-muted-foreground mb-3 text-center font-medium">Back Row</p>
                <div className="flex justify-center gap-2 flex-wrap bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                  {Array.from({ length: parseInt(bus.backRowSeats || 5) }).map((_, col) => {
                    const seat = `Back${col + 1}`;
                    const status = getSeatStatus(seat);
                    return (
                      <button
                        key={seat}
                        onClick={() => toggleSeat(seat)}
                        disabled={status === "booked"}
                        className={`w-14 h-14 rounded-xl font-semibold text-base border-2 shadow-sm transition-all duration-300 cursor-pointer
                          ${status === "available"
                            ? "bg-green-50 hover:bg-green-100 border-green-500 text-green-800 hover:shadow-md"
                            : "bg-red-50 border-red-500 text-red-800 cursor-not-allowed"}`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="text-center mt-12">
              <p className="text-2xl font-bold mb-6">
                Available Seats: {availableCount} / {totalSeats}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 px-10 py-6 text-lg font-semibold">
                Confirm Booking (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}