// src/Passenger/MyBookings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bus, Ticket, Trash2, Clock } from "lucide-react";
import TicketQRCode from "@/components/TicketQRCode";

function getRoutes() {
  return JSON.parse(localStorage.getItem("routes")) || [];
}

function getPendingPayment() {
  try {
    return JSON.parse(localStorage.getItem("pendingPayment") || "null");
  } catch {
    return null;
  }
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("userBookings") || "[]"));
  const [routes] = useState(getRoutes);
  const [pendingPayment, setPendingPayment] = useState(getPendingPayment);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger-login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
      setPendingPayment(getPendingPayment());
    }, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleCancelClick = (bookingId) => {
    setCancelBookingId(bookingId);
  };

  const confirmCancel = () => {
    if (!cancelBookingId) return;
    
    const updatedBookings = bookings.filter((b) => b.bookingId !== cancelBookingId);
    setBookings(updatedBookings);
    localStorage.setItem("userBookings", JSON.stringify(updatedBookings));
    
    setCancelBookingId(null);
    alert("✅ Booking cancelled successfully!");
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRouteDetails = (routeId) => routes.find((r) => r.routeId === routeId);
  const bookingItems = bookings.map((booking) => {
    const route = getRouteDetails(booking.routeId);
    const departureAt = new Date(`${booking.date || route?.date || ""}T${booking.departureTime || route?.startTime || ""}`);
    return {
      ...booking,
      displayStatus: !Number.isNaN(departureAt.getTime()) && departureAt <= currentTime ? "expired" : "confirmed",
    };
  });

  if (pendingPayment && !bookings.some((booking) => booking.bookingId === pendingPayment.bookingId)) {
    bookingItems.push({ ...pendingPayment, displayStatus: "processing", isPendingPayment: true });
  }

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "expired", label: "Expired" },
  ];
  const statusCounts = bookingItems.reduce((counts, booking) => {
    counts[booking.displayStatus] += 1;
    return counts;
  }, { confirmed: 0, processing: 0, expired: 0 });
  const visibleBookings = selectedStatus === "all"
    ? bookingItems
    : bookingItems.filter((booking) => booking.displayStatus === selectedStatus);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/passenger-dashboard")} 
          className="h-11 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Bookings
          </h2>
          <p className="text-muted-foreground">Your upcoming and recent journeys</p>
        </div>
        {bookingItems.length > 0 && (
          <Button
            onClick={() => navigate("/passenger-dashboard/search-buses")}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            <Bus className="mr-2 h-4 w-4" /> Book another trip
          </Button>
        )}
      </div>

      {bookingItems.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter bookings by status">
          {statusFilters.map((filter) => {
            const count = filter.value === "all" ? bookingItems.length : statusCounts[filter.value];
            return (
              <Button
                key={filter.value}
                type="button"
                variant={selectedStatus === filter.value ? "default" : "outline"}
                aria-pressed={selectedStatus === filter.value}
                onClick={() => setSelectedStatus(filter.value)}
              >
                {filter.label} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {bookingItems.length === 0 ? (
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-600 text-white">
          <CardContent className="p-20 text-center">
            <Ticket className="w-24 h-24 mx-auto mb-6 opacity-90" />
            <h3 className="text-3xl font-semibold mb-3">No bookings yet</h3>
            <p className="text-blue-100 mb-8 text-lg">Ready for your next trip?</p>
            <Button
              onClick={() => navigate("/passenger-dashboard/search-buses")}
              size="lg"
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-10"
            >
              Browse Buses
            </Button>
          </CardContent>
        </Card>
      ) : visibleBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No {selectedStatus} bookings.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {visibleBookings.map((booking) => {
            const route = getRouteDetails(booking.routeId);
            const isExpired = booking.displayStatus === "expired";
            const isProcessing = booking.displayStatus === "processing";
            
            let duration = "—";
            if (route?.startTime && route?.endTime) {
              const [sh, sm] = route.startTime.split(":").map(Number);
              const [eh, em] = route.endTime.split(":").map(Number);
              let mins = (eh * 60 + em) - (sh * 60 + sm);
              if (mins < 0) mins += 24 * 60;
              duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
            }

            return (
              <Card 
                key={booking.bookingId} 
                className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 hover:shadow-3xl transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Journey Details - More Colorful */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-3xl font-bold text-gray-900">
                            {route ? `${route.startStop} → ${route.endStop}` : booking.startStop && booking.endStop ? `${booking.startStop} → ${booking.endStop}` : "Bus Journey"}
                          </h3>
                          <p className="text-lg text-purple-600 font-medium mt-1">
                            {route?.routeName || "Express Route"}
                          </p>
                        </div>
                        <Badge className={isProcessing
                          ? "bg-amber-500 text-white px-5 py-1.5 text-sm font-medium shadow"
                          : isExpired
                            ? "bg-rose-600 text-white px-5 py-1.5 text-sm font-medium shadow"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-1.5 text-sm font-medium shadow"}
                        >
                          {booking.displayStatus.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Time & Duration - Bigger & Colorful */}
                      <div className="mt-8 flex items-center gap-8">
                        <div className="text-center bg-white/70 rounded-2xl px-6 py-4 shadow-sm">
                          <p className="text-xs text-emerald-600 font-medium">DEPARTURE</p>
                          <p className="text-4xl font-bold text-emerald-600 mt-1">{booking.departureTime || route?.startTime}</p>
                          <p className="text-sm text-gray-600 mt-1">{booking.date || route?.date}</p>
                        </div>

                        <div className="flex-1 h-px bg-gradient-to-r from-emerald-400 via-purple-400 to-violet-400" />

                        <div className="text-center bg-white/70 rounded-2xl px-6 py-4 shadow-sm">
                          <p className="text-xs text-violet-600 font-medium">ARRIVAL</p>
                          <p className="text-4xl font-bold text-violet-600 mt-1">{route?.endTime}</p>
                          <p className="text-sm text-gray-600 mt-1">{duration}</p>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-200 bg-white/60 rounded-2xl p-6">
                        <div>
                          <p className="text-xs text-muted-foreground">BUS NUMBER</p>
                          <p className="font-semibold text-xl mt-1 text-blue-700">{booking.busNo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">SEAT NO</p>
                          <p className="font-bold text-3xl text-blue-600 mt-1">{booking.seat}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">BOOKED ON</p>
                          <p className="font-medium mt-1 text-gray-700">{booking.bookingDate ? formatDateTime(booking.bookingDate) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">BOOKING ID</p>
                          <p className="font-mono text-sm text-gray-600 mt-1 break-all">{booking.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">BOARDING STOP</p>
                          <p className="font-medium mt-1 text-gray-700">{booking.boardingStop || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">DROP-OFF STOP</p>
                          <p className="font-medium mt-1 text-gray-700">{booking.dropStop || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">PAYMENT</p>
                          <p className={`font-semibold mt-1 ${isProcessing ? "text-amber-700" : "text-emerald-700"}`}>
                            {isProcessing ? "Processing" : booking.paymentStatus === "SUCCEEDED" ? "Successful" : booking.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">AMOUNT PAID</p>
                          <p className="font-medium mt-1 text-gray-700">
                            {booking.amountCents != null
                              ? `${(booking.amountCents / 100).toFixed(2)} ${(booking.currency || "").toUpperCase()}`.trim()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section - More Vibrant */}
                    <div className="lg:w-80 flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border border-blue-100">
                      {isProcessing ? (
                        <>
                          <Clock className="h-12 w-12 text-amber-600" />
                          <p className="mt-4 text-center font-semibold text-slate-800">Payment is processing</p>
                          <p className="mt-2 text-center text-sm text-slate-500">Your ticket will be available after payment is confirmed.</p>
                        </>
                      ) : (
                        <>
                          <div className="bg-white p-5 rounded-3xl shadow-xl">
                            <TicketQRCode
                              value={`Ticket ID: ${booking.bookingId}\nBus: ${booking.busNo}\nSeat: ${booking.seat}\nRoute: ${route ? `${route.startStop} → ${route.endStop}` : booking.routeId}`}
                              size={170}
                            />
                          </div>
                          <p className="text-center text-xs text-slate-500 mt-4">Scan at boarding point</p>

                          <Button
                            variant="destructive"
                            size="lg"
                            className="mt-8 w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg"
                            onClick={() => handleCancelClick(booking.bookingId)}
                          >
                            <Trash2 className="mr-2 h-5 w-5" />
                            Cancel Ticket
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal - More Colorful */}
      {cancelBookingId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 to-zinc-900 border-0 text-white">
            <CardContent className="p-10 text-center">
              <div className="text-red-500 mb-6">
                <Trash2 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Cancel this booking?</h3>
              <p className="text-slate-400 mb-8">
                This action cannot be undone. Are you sure?
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                  onClick={() => setCancelBookingId(null)}
                >
                  No, Keep It
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={confirmCancel}
                >
                  Yes, Cancel Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}