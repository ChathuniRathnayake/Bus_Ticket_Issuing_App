import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, Trash2 } from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger-login");
      return;
    }

    // Load bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem("userBookings")) || [];
    setBookings(savedBookings);
  }, [navigate]);

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = bookings.filter((b) => b.bookingId !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem("userBookings", JSON.stringify(updatedBookings));
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/passenger-dashboard")} className="h-10 gap-2 hover:bg-muted cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your bus tickets
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't booked any buses yet. Search and book your first ticket!
            </p>
            <Button
              onClick={() => navigate("/passenger-dashboard/search-buses")}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Search Buses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.bookingId} className="shadow-lg rounded-2xl hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-6 flex-1">
                    {/* Ticket Icon */}
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{booking.busNo}</h3>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">Route: {booking.routeId}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Seat Number</p>
                          <p className="font-semibold text-lg text-blue-600">{booking.seat}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booking ID</p>
                          <p className="font-mono text-xs">{booking.bookingId.split("-").slice(0, 2).join("-")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booked On</p>
                          <p className="font-semibold">{formatDate(booking.bookingDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleCancelBooking(booking.bookingId)}
                    className="gap-2 hover:bg-red-50 hover:text-red-600 ml-4 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
