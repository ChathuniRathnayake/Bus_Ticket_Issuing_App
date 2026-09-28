// src/Admin/ManageBookings.jsx
import { Fragment, useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Ticket, ChevronDown, ChevronUp, RefreshCw, Search } from "lucide-react";

export default function ManageBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const [busesRes, routesRes, schedulesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/bus", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/route", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/schedule", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const buses = busesRes.data;
      const routes = routesRes.data;
      const schedules = schedulesRes.data;

      const ticketResults = await Promise.allSettled(buses.map((bus) =>
        axios.get(`http://localhost:5000/api/ticket/bus/${bus.id || bus.busId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      const tickets = ticketResults.flatMap((result) =>
        result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : []
      );

      const enriched = tickets.map((ticket) => {
        const bus = buses.find((item) => item.id === ticket.busId || item.busId === ticket.busId);
        const schedule = schedules.find((item) => item.id === ticket.scheduleId || item.scheduleId === ticket.scheduleId);
        const routeId = ticket.routeId || schedule?.routeId;
        const route = routes.find((item) => item.id === routeId || item.routeId === routeId);
        return {
          ...ticket,
          id: ticket.bookingId || ticket.id || ticket.ticketId,
          bookingId: ticket.bookingId || ticket.id || ticket.ticketId,
          seatNumber: ticket.seatNumber ?? ticket.seatNo,
          date: ticket.date || schedule?.date,
          departureTime: ticket.departureTime || schedule?.departureTime,
          busNo: bus?.busNo || ticket.busId || "Unknown",
          routeName: route?.routeName || (route ? `${route.startStop} → ${route.endStop}` : routeId || "Unknown"),
          route,
        };
      });

      enriched.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
      setBookings(enriched);
      if (ticketResults.some((result) => result.status === "rejected")) {
        setErrorMessage("Some buses could not be loaded. Displaying tickets from the buses that responded.");
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load bookings. Check that the backend is available.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBookings = bookings.filter((booking) =>
    [booking.bookingId, booking.passengerName, booking.userId, booking.busNo, booking.routeName,
      booking.seatNumber, booking.date, booking.boardingStop, booking.dropStop, booking.status]
      .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
  );

  function getTimestamp(value) {
    if (value?.seconds) return value.seconds * 1000;
    if (typeof value?.toDate === "function") return value.toDate().getTime();
    return new Date(value || 0).getTime() || 0;
  }

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    const date = new Date(getTimestamp(createdAt));
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
    if (["confirmed", "booked"].includes(s)) {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confirmed</Badge>;
    }
    if (s === "cancelled") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>;
    }
    if (s.includes("payment")) return <Badge variant="secondary">Pending payment</Badge>;
    return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  };

  const formatFare = (booking) => {
    if (Number.isFinite(Number(booking.amountCents))) {
      return `${booking.currency || "USD"} ${(Number(booking.amountCents) / 100).toFixed(2)}`;
    }
    if (booking.price !== undefined) return `${booking.currency || ""} ${booking.price}`.trim();
    return "Not recorded";
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

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings, passenger, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Refresh bookings" aria-label="Refresh bookings">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription className="text-muted-foreground">
            All passenger bookings across every bus and route
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{errorMessage}</p>}
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
                    <TableHead>Passenger</TableHead>
                    <TableHead>Bus No</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBookings.map((b) => (
                    <Fragment key={b.id || b.bookingId}>
                    <TableRow
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >
                      <TableCell className="font-mono text-xs">
                        {b.bookingId || b.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{b.passengerName || "Passenger"}</div>
                        <div className="font-mono text-xs text-muted-foreground">{b.userId || "UID unavailable"}</div>
                      </TableCell>
                      <TableCell>{b.busNo}</TableCell>
                      <TableCell>{b.routeName}</TableCell>
                      <TableCell className="font-semibold">{b.seatNumber}</TableCell>
                      <TableCell>{formatDate(b.createdAt)}</TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                          aria-label={expandedId === b.id ? "Hide booking details" : "Show booking details"}
                          aria-expanded={expandedId === b.id}
                        >
                          {expandedId === b.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === b.id && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
                            <Detail label="Booking ID" value={b.bookingId} mono />
                            <Detail label="Ticket ID" value={b.ticketId || b.id} mono />
                            <Detail label="Passenger name" value={b.passengerName || "Not provided"} />
                            <Detail label="Passenger UID" value={b.userId} mono />
                            <Detail label="Bus" value={`${b.busNo}${b.busId ? ` (${b.busId})` : ""}`} />
                            <Detail label="Route" value={b.routeName} />
                            <Detail label="Travel date" value={b.date || "Not recorded"} />
                            <Detail label="Departure" value={b.departureTime || "Not recorded"} />
                            <Detail label="Seat" value={b.seatNumber} />
                            <Detail label="Boarding stop" value={b.boardingStop || b.boardingStopId} />
                            <Detail label="Drop-off stop" value={b.dropStop || b.dropStopId} />
                            <Detail label="Fare" value={formatFare(b)} />
                            <Detail label="Booking channel" value={b.bookingChannel || "Not recorded"} />
                            <Detail label="Booked at" value={formatDate(b.createdAt)} />
                            <Detail label="Ticket status" value={b.status} />
                            <Detail label="Schedule ID" value={b.scheduleId} mono />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </Fragment>
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

function Detail({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1 break-words text-sm ${mono ? "font-mono" : "font-medium"}`}>{value || "Not recorded"}</p>
    </div>
  );
}