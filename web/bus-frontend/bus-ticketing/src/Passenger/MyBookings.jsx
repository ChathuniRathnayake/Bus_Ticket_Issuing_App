// src/Passenger/MyBookings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, Trash2, Calendar, Clock } from "lucide-react";
import TicketQRCode from "@/components/TicketQRCode";

function getRoutes() {
  return JSON.parse(localStorage.getItem("routes")) || [];
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger-login");
      return;
    }
    setRoutes(getRoutes());
    const savedBookings = JSON.parse(localStorage.getItem("userBookings")) || [];
    setBookings(savedBookings);
  }, [navigate]);

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

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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
      </div>

      {bookings.length === 0 ? (
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
      ) : (
        <div className="space-y-8">
          {bookings.map((booking) => {
            const route = getRouteDetails(booking.routeId);
            
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
                            {route ? `${route.startStop} → ${route.endStop}` : "Bus Journey"}
                          </h3>
                          <p className="text-lg text-purple-600 font-medium mt-1">
                            {route?.routeName || "Express Route"}
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-1.5 text-sm font-medium shadow">
                          CONFIRMED
                        </Badge>
                      </div>

                      {/* Time & Duration - Bigger & Colorful */}
                      <div className="mt-8 flex items-center gap-8">
                        <div className="text-center bg-white/70 rounded-2xl px-6 py-4 shadow-sm">
                          <p className="text-xs text-emerald-600 font-medium">DEPARTURE</p>
                          <p className="text-4xl font-bold text-emerald-600 mt-1">{route?.startTime}</p>
                          <p className="text-sm text-gray-600 mt-1">{route?.date}</p>
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
                          <p className="font-medium mt-1 text-gray-700">{formatDateTime(booking.bookingDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">BOOKING ID</p>
                          <p className="font-mono text-sm text-gray-600 mt-1 break-all">{booking.bookingId}</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section - More Vibrant */}
                    <div className="lg:w-80 flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border border-blue-100">
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