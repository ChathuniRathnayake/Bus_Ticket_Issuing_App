// src/Admin/ManageBookings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Ticket, XCircle } from "lucide-react";

export default function ManageBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =====================================================
     FETCH BOOKINGS + BUSES + ROUTES, THEN ENRICH
     ---------------------------------------------------
     ⚠️ NOTE FOR BACKEND: this calls GET /api/booking to
     get EVERY booking in the system. That admin-facing
     endpoint doesn't exist on the backend yet (only
     "/my" and "/schedule/:scheduleId" do). You'll need
     to add something like:
         router.get("/", verifyToken, verifyAdmin, getAllBookings);
     to bookingRoutes.js + a matching getAllBookings
     controller function before this page will show
     real data. This file is frontend-only for now.
  ===================================================== */
  const fetchData = async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      setLoading(true);

      const [bookingsRes, busesRes, routesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/booking", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/bus", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/route", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const busesData = busesRes.data;
      const routesData = routesRes.data;

      // Fill in bus number + route name for each booking so the
      // table is readable (bookings only store raw IDs).
      const enriched = bookingsRes.data.map((booking) => {
        const bus = busesData.find(
          (b) => b.id === booking.busId || b.busId === booking.busId
        );
        const route = routesData.find(
          (r) => r.routeId === booking.routeId || r.id === booking.routeId
        );

        return {
          ...booking,
          busNo: bus?.busNo || "Unknown",
          routeName: route
            ? `${route.startStop} → ${route.endStop}`
            : booking.routeId || "Unknown",
        };
      });

      // Most recent bookings first
      enriched.sort((a, b) => {
        const dateA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setBookings(enriched);
      setFilteredBookings(enriched);
    } catch (error) {
      console.error("Fetch bookings error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to fetch bookings. (Is the /api/booking GET-all endpoint added on the backend yet?)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchData();
  }, []);

  // 🔎 Search across booking id, bus number, route name, seat, passenger id
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredBookings(
      bookings.filter(
        (b) =>
          b.bookingId?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q) ||
          b.busNo?.toLowerCase().includes(q) ||
          b.routeName?.toLowerCase().includes(q) ||
          String(b.seatNumber || "").toLowerCase().includes(q) ||
          b.userId?.toLowerCase().includes(q)
      )
    );
  }, [search, bookings]);

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    const date = createdAt.seconds
      ? new Date(createdAt.seconds * 1000)
      : new Date(createdAt);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confirmed</Badge>;
    }
    if (s === "cancelled") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>;
    }
    return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  };

  // ⚠️ Uses the existing PUT /api/booking/cancel/:bookingId endpoint.
  // That endpoint currently only lets the OWNER of a booking cancel it,
  // so an admin cancelling someone else's booking will need a small
  // backend tweak (e.g. skip the ownership check when verifyAdmin passes).
  // Kept here so the UI/UX is ready once that's added.
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await axios.put(
        `http://localhost:5000/api/booking/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Manage Bookings</h2>
        </div>

        <Input
          placeholder="Search by booking, bus, route, seat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 h-10"
        />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription className="text-muted-foreground">
            All passenger bookings across every bus and route
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-muted-foreground">Loading...</p>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Passenger (UID)</TableHead>
                    <TableHead>Bus No</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow
                      key={b.id || b.bookingId}
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >
                      <TableCell className="font-mono text-xs">
                        {b.bookingId || b.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{b.userId}</TableCell>
                      <TableCell>{b.busNo}</TableCell>
                      <TableCell>{b.routeName}</TableCell>
                      <TableCell className="font-semibold">{b.seatNumber}</TableCell>
                      <TableCell>{formatDate(b.createdAt)}</TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        {b.status === "Confirmed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(b.id || b.bookingId)}
                            className="gap-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" /> Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}