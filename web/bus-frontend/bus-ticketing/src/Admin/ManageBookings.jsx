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
import { ArrowLeft, Bus, Ticket, ChevronDown, ChevronUp, RefreshCw, Search } from "lucide-react";

export default function ManageBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [seatMapTrips, setSeatMapTrips] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMapError, setSeatMapError] = useState("");
  const [activeView, setActiveView] = useState("layout");
  const [highlightedSeat, setHighlightedSeat] = useState("");
  const [tripPeriodFilter, setTripPeriodFilter] = useState("all");
  const [busIdFilter, setBusIdFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [bookingFocus, setBookingFocus] = useState(null);
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
      const trips = schedules.map((schedule) => {
        const bus = buses.find((item) => item.id === schedule.busId || item.busId === schedule.busId);
        const route = routes.find((item) => item.id === schedule.routeId || item.routeId === schedule.routeId);
        return {
          ...bus,
          scheduleId: schedule.id || schedule.scheduleId,
          schedule,
          route,
        };
      }).filter((trip) => trip.id || trip.busId);
      setSeatMapTrips(trips);
      setSelectedScheduleId((currentId) =>
        trips.some((trip) => trip.scheduleId === currentId) ? currentId : trips[0]?.scheduleId || ""
      );

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

      enriched.sort((a, b) => getTimestamp(getBookedAt(b)) - getTimestamp(getBookedAt(a)));
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

  const getTripDepartureTimestamp = (trip) => {
    const date = trip.schedule?.date || trip.date;
    const time = trip.schedule?.departureTime || trip.departureTime || "23:59:59";
    const timestamp = date ? new Date(`${date}T${time}`).getTime() : null;
    return Number.isFinite(timestamp) ? timestamp : null;
  };

  const matchesTripFilters = (trip) => {
    const busId = trip.schedule?.busId || trip.busId || trip.id;
    const routeId = trip.schedule?.routeId || trip.routeId || trip.route?.routeId || trip.route?.id;
    const departureTime = trip.schedule?.departureTime || trip.departureTime || "";
    if (busIdFilter && String(busId) !== busIdFilter) return false;
    if (routeFilter && String(routeId) !== routeFilter) return false;
    if (startTimeFilter && departureTime !== startTimeFilter) return false;

    const departureTimestamp = getTripDepartureTimestamp(trip);
    if (tripPeriodFilter === "upcoming" && (departureTimestamp === null || departureTimestamp < Date.now())) return false;
    if (tripPeriodFilter === "expired" && (departureTimestamp === null || departureTimestamp >= Date.now())) return false;
    return true;
  };

  const filteredSeatMapTrips = seatMapTrips.filter(matchesTripFilters);
  const selectedSeatMapTrip = filteredSeatMapTrips.find((trip) => trip.scheduleId === selectedScheduleId)
    || filteredSeatMapTrips[0];
  const busIdOptions = [...new Map(seatMapTrips.map((trip) => {
    const id = String(trip.schedule?.busId || trip.id || trip.busId);
    return [id, { id, label: `${trip.busId || trip.id || id} · ${trip.busNo || "Bus"}` }];
  })).values()].sort((first, second) => first.label.localeCompare(second.label));
  const routeOptions = [...new Map(seatMapTrips.map((trip) => {
    const id = String(trip.schedule?.routeId || trip.route?.routeId || trip.route?.id || "");
    const label = trip.route?.routeName || `${trip.route?.startStop || "Route"} → ${trip.route?.endStop || "Destination"}`;
    return [id, { id, label: `${label} · ${id}` }];
  }).filter(([id]) => id)).values()].sort((first, second) => first.label.localeCompare(second.label));
  const startTimeOptions = [...new Set(seatMapTrips
    .map((trip) => trip.schedule?.departureTime || trip.departureTime)
    .filter(Boolean))].sort();

  useEffect(() => {
    if (!selectedSeatMapTrip?.scheduleId || !(selectedSeatMapTrip.id || selectedSeatMapTrip.busId)) {
      setOccupiedSeats([]);
      setSeatMapLoading(false);
      return undefined;
    }

    let isCurrent = true;
    setOccupiedSeats([]);
    setSeatMapError("");
    setSeatMapLoading(true);
    const route = selectedSeatMapTrip.route;
    const routeStops = getRouteStops(route);
    const firstStop = routeStops[0];
    const lastStop = routeStops.at(-1);
    if (!firstStop?.stopId || !lastStop?.stopId) {
      setSeatMapError("This route does not have usable start and destination stops.");
      setSeatMapLoading(false);
      return undefined;
    }

    const refreshAvailability = async () => {
      try {
        const params = new URLSearchParams({
          scheduleId: selectedSeatMapTrip.scheduleId,
          busId: selectedSeatMapTrip.id || selectedSeatMapTrip.busId,
          boardingStopId: firstStop.stopId,
          dropStopId: lastStop.stopId,
        });
        const response = await axios.get(`http://localhost:5000/api/ticket/availability?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isCurrent) {
          setOccupiedSeats(Array.isArray(response.data.occupiedSeats) ? response.data.occupiedSeats.map(String) : []);
          setSeatMapError("");
        }
      } catch (error) {
        if (isCurrent) setSeatMapError(error.response?.data?.message || "Could not refresh seat availability.");
      } finally {
        if (isCurrent) setSeatMapLoading(false);
      }
    };

    refreshAvailability();
    const interval = window.setInterval(refreshAvailability, 5000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [selectedSeatMapTrip, token]);

  const filteredBookings = bookings.filter((booking) => {
    const scheduledTrip = seatMapTrips.find((trip) => String(trip.scheduleId) === String(booking.scheduleId));
    const bookingTrip = {
      busId: booking.busId || scheduledTrip?.schedule?.busId || scheduledTrip?.id,
      routeId: booking.routeId || scheduledTrip?.schedule?.routeId || scheduledTrip?.route?.routeId || scheduledTrip?.route?.id,
      date: booking.date || scheduledTrip?.schedule?.date,
      departureTime: booking.departureTime || scheduledTrip?.schedule?.departureTime,
    };
    const isFocusedBooking = bookingFocus?.bookingIds.includes(booking.id) || false;
    return (bookingFocus ? isFocusedBooking : matchesTripFilters(bookingTrip))
      && [booking.bookingId, booking.passengerName, booking.userId, booking.busNo, booking.routeName,
        booking.seatNumber, booking.date, booking.boardingStop, booking.dropStop, booking.status]
        .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()));
  });

  const showBookingForSeat = (seatNumber) => {
    const trip = selectedSeatMapTrip;
    const busIds = new Set([trip?.schedule?.busId, trip?.id, trip?.busId].filter(Boolean).map(String));
    const scheduleIds = new Set([trip?.scheduleId, trip?.schedule?.id, trip?.schedule?.scheduleId].filter(Boolean).map(String));
    const tripDate = String(trip?.schedule?.date || trip?.date || "").slice(0, 10);
    const tripStartTime = String(trip?.schedule?.departureTime || trip?.departureTime || "").slice(0, 5);
    const seatBookings = bookings.filter((booking) =>
      String(booking.seatNumber ?? booking.seatNo ?? "").trim().toUpperCase() === seatNumber.trim().toUpperCase()
    );
    const busIdMatches = seatBookings.filter((booking) => !booking.busId || busIds.has(String(booking.busId)));
    const busNumberMatches = seatBookings.filter((booking) => booking.busNo && booking.busNo === trip?.busNo);
    const sameBusBookings = busIdMatches.length > 0
      ? busIdMatches
      : busNumberMatches.length > 0
        ? busNumberMatches
        : seatBookings.filter((booking) => !booking.busId && !booking.busNo);
    const matchingBookings = sameBusBookings.filter((booking) => {
      const sameSchedule = booking.scheduleId && scheduleIds.has(String(booking.scheduleId));
      const sameDeparture = String(booking.date || "").slice(0, 10) === tripDate
        && String(booking.departureTime || "").slice(0, 5) === tripStartTime;
      return sameSchedule || sameDeparture || !booking.scheduleId;
    });
    const bookingsToShow = matchingBookings.length > 0 ? matchingBookings : sameBusBookings;

    if (bookingsToShow.length === 0) {
      setSeatMapError(`No ticket record was found for booked seat ${seatNumber} on this trip.`);
      return;
    }

    const bookingIds = bookingsToShow.map((booking) => booking.id);
    setBookingFocus({ seatNumber, bookingIds });
    setSearch("");
    setSeatMapError("");
    setExpandedIds(new Set(bookingIds));
    setActiveView("bookings");
    window.requestAnimationFrame(() => {
      document.getElementById("admin-bookings-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  function getTimestamp(value) {
    if (typeof value?.toDate === "function") return value.toDate().getTime();
    const seconds = value?.seconds ?? value?._seconds;
    const nanoseconds = value?.nanoseconds ?? value?._nanoseconds ?? 0;
    if (seconds !== undefined && Number.isFinite(Number(seconds))) {
      return Number(seconds) * 1000 + Number(nanoseconds) / 1_000_000;
    }
    const timestamp = new Date(value || "").getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  function getBookedAt(booking) {
    return booking.bookedAt || booking.confirmedAt || booking.createdAt;
  }

  const formatDate = (timestampValue) => {
    if (!timestampValue) return "-";
    const timestamp = getTimestamp(timestampValue);
    if (timestamp === null) return "-";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-LK", {
      timeZone: "Asia/Colombo",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
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
          {activeView === "bookings" && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings, passenger, route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          )}
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Refresh bookings" aria-label="Refresh bookings">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-6 mb-5 space-y-3 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div role="tablist" aria-label="Booking views" className="flex gap-2">
          <Button
            role="tab"
            aria-selected={activeView === "layout"}
            variant={activeView === "layout" ? "default" : "outline"}
            onClick={() => setActiveView("layout")}
            className="gap-2"
          >
            <Bus className="h-4 w-4" /> Seat Layout
          </Button>
          <Button
            role="tab"
            aria-selected={activeView === "bookings"}
            variant={activeView === "bookings" ? "default" : "outline"}
            onClick={() => {
              setBookingFocus(null);
              setActiveView("bookings");
            }}
            className="gap-2"
          >
            <Ticket className="h-4 w-4" /> All Bookings
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Trip period
            <select value={tripPeriodFilter} onChange={(event) => setTripPeriodFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              <option value="all">All trips</option>
              <option value="upcoming">Upcoming trips</option>
              <option value="expired">Expired trips</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Bus ID
            <select value={busIdFilter} onChange={(event) => setBusIdFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              <option value="">All buses</option>
              {busIdOptions.map((bus) => <option key={bus.id} value={bus.id}>{bus.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Route
            <select value={routeFilter} onChange={(event) => setRouteFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              <option value="">All routes</option>
              {routeOptions.map((route) => <option key={route.id} value={route.id}>{route.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Route start time
            <select value={startTimeFilter} onChange={(event) => setStartTimeFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              <option value="">All start times</option>
              {startTimeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </label>
          <Button variant="outline" size="sm" className="self-end" disabled={!busIdFilter && !routeFilter && !startTimeFilter && tripPeriodFilter === "all"} onClick={() => {
            setTripPeriodFilter("all");
            setBusIdFilter("");
            setRouteFilter("");
            setStartTimeFilter("");
          }}>Clear filters</Button>
        </div>
      </div>

      {activeView === "layout" && <Card className="mb-6 shadow-lg rounded-2xl border-border">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Live Bus Seat Layout</CardTitle>
            <CardDescription className="mt-1">Seat availability for the selected scheduled trip, refreshed every 5 seconds</CardDescription>
          </div>
          <select
            aria-label="Select bus schedule for seat layout"
            value={selectedSeatMapTrip?.scheduleId || ""}
            onChange={(event) => {
              setSelectedScheduleId(event.target.value);
              setHighlightedSeat("");
            }}
            className="h-10 min-w-64 max-w-full rounded-md border border-input bg-background px-3 text-sm"
            disabled={seatMapTrips.length === 0}
          >
            {filteredSeatMapTrips.map((trip) => (
              <option key={trip.scheduleId} value={trip.scheduleId}>
                {trip.busNo || trip.busId} · {trip.route?.routeName || `${trip.route?.startStop || "Route"} → ${trip.route?.endStop || "Destination"}`} · {trip.schedule?.date || "Date unavailable"} {trip.schedule?.departureTime || ""}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {seatMapError && <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{seatMapError}</p>}
          {selectedSeatMapTrip ? (
            <AdminSeatMap
              trip={selectedSeatMapTrip}
              occupiedSeats={occupiedSeats}
              loading={seatMapLoading}
              highlightedSeat={highlightedSeat}
              onBookedSeatClick={showBookingForSeat}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No scheduled buses are available to display.</p>
          )}
        </CardContent>
      </Card>}

      {activeView === "bookings" && <Card id="admin-bookings-panel" className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription className="text-muted-foreground">
            All passenger bookings across every bus and route
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{errorMessage}</p>}
          {bookingFocus && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <span>Showing booking details for seat {bookingFocus.seatNumber} on the selected trip.</span>
              <Button variant="outline" size="sm" onClick={() => {
                setBookingFocus(null);
                setExpandedIds(new Set());
              }}>Show all bookings</Button>
            </div>
          )}
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
                      <TableCell>{formatDate(getBookedAt(b))}</TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedIds((currentIds) => {
                            const nextIds = new Set(currentIds);
                            if (nextIds.has(b.id)) nextIds.delete(b.id);
                            else nextIds.add(b.id);
                            return nextIds;
                          })}
                          aria-label={expandedIds.has(b.id) ? "Hide booking details" : "Show booking details"}
                          aria-expanded={expandedIds.has(b.id)}
                        >
                          {expandedIds.has(b.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedIds.has(b.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="p-5">
                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
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
                              <Detail label="Booked at" value={formatDate(getBookedAt(b))} />
                              <Detail label="Ticket status" value={b.status} />
                              <Detail label="Schedule ID" value={b.scheduleId} mono />
                            </div>
                            <Button
                              className="mt-5 gap-2"
                              disabled={!seatMapTrips.some((trip) => trip.scheduleId === b.scheduleId) || !b.seatNumber}
                              onClick={() => {
                                const trip = seatMapTrips.find((item) => item.scheduleId === b.scheduleId);
                                if (!trip) return;
                                setSelectedScheduleId(trip.scheduleId);
                                setHighlightedSeat(String(b.seatNumber));
                                setTripPeriodFilter(getTripDepartureTimestamp(trip) === null
                                  ? "all"
                                  : getTripDepartureTimestamp(trip) < Date.now() ? "expired" : "upcoming");
                                setBusIdFilter(String(trip.schedule?.busId || trip.id || trip.busId));
                                setRouteFilter(String(trip.schedule?.routeId || trip.route?.routeId || trip.route?.id || ""));
                                setStartTimeFilter(trip.schedule?.departureTime || trip.departureTime || "");
                                setBookingFocus(null);
                                setActiveView("layout");
                                window.requestAnimationFrame(() => {
                                  document.getElementById(`admin-seat-${b.seatNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                                });
                              }}
                            >
                              <Bus className="h-4 w-4" /> Locate seat in layout
                            </Button>
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
      </Card>}

    </div>
  );
}

function getRouteStops(route) {
  if (Array.isArray(route?.stops) && route.stops.length >= 2) {
    return route.stops.map((stop, index) => {
      if (typeof stop !== "string") return { ...stop, sequence: Number.isInteger(stop.sequence) ? stop.sequence : index };
      const slug = stop.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "stop";
      return { stopId: `legacy-${index}-${slug}`, name: stop, sequence: index };
    }).sort((a, b) => a.sequence - b.sequence);
  }
  return [
    { stopId: `legacy-${route?.routeId || route?.startStop}-origin`, name: route?.startStop, sequence: 0 },
    { stopId: `legacy-${route?.routeId || route?.endStop}-destination`, name: route?.endStop, sequence: 1 },
  ];
}

function AdminSeatMap({ trip, occupiedSeats, loading, highlightedSeat, onBookedSeatClick }) {
  const leftColumns = Number.parseInt(trip.leftColumns, 10) || 2;
  const rightColumns = Number.parseInt(trip.rightColumns, 10) || 2;
  const leftRows = Number.parseInt(trip.leftRows, 10) || 10;
  const rightRows = Number.parseInt(trip.rightRows, 10) || 10;
  const backRowSeats = Number.parseInt(trip.backRowSeats, 10) || 5;
  const hasFrontSingle = trip.hasFrontSingle === "yes" || trip.hasFrontSingle === true;
  const hasBackFullRow = trip.hasBackFullRow === "yes" || trip.hasBackFullRow === true;
  const seatsPerRow = leftColumns + rightColumns;
  const maxRows = Math.max(leftRows, rightRows);
  const getSeatNumber = (row, column) => String(row * seatsPerRow + column + 1);
  const getBackSeatNumber = (column) => String(maxRows * seatsPerRow + column + 1);
  const layoutSeatNumbers = [
    ...(hasFrontSingle ? ["C"] : []),
    ...Array.from({ length: leftRows }, (_, row) =>
      Array.from({ length: leftColumns }, (_, column) => getSeatNumber(row, column)),
    ).flat(),
    ...Array.from({ length: rightRows }, (_, row) =>
      Array.from({ length: rightColumns }, (_, column) => getSeatNumber(row, leftColumns + column)),
    ).flat(),
    ...(hasBackFullRow ? Array.from({ length: backRowSeats }, (_, column) => getBackSeatNumber(column)) : []),
  ];
  const seatCount = layoutSeatNumbers.length;
  const occupied = new Set(occupiedSeats);
  const layoutSeatSet = new Set(layoutSeatNumbers);
  const occupiedCount = [...occupied].filter((seat) => layoutSeatSet.has(seat)).length;
  const seatClass = (seat) => loading
    ? "border-slate-300 bg-slate-100 text-slate-500"
    : occupied.has(seat)
    ? "border-red-400 bg-red-100 text-red-700"
    : "border-emerald-400 bg-emerald-50 text-emerald-700";
  const seat = (label) => {
    const isBooked = occupied.has(label) && !loading;
    return (
      <button
        id={`admin-seat-${label}`}
        key={label}
        type="button"
        disabled={!isBooked}
        onClick={() => onBookedSeatClick?.(label)}
        aria-label={`Seat ${label}, ${isBooked ? "booked, view booking details" : loading ? "loading availability" : "available"}`}
        title={`${label}: ${loading ? "Loading" : occupied.has(label) ? "Booked" : "Available"}`}
        className={`flex h-9 w-9 shrink-0 items-end justify-center rounded-t-xl rounded-b border-2 pb-1 text-[10px] font-bold disabled:cursor-default disabled:opacity-100 ${seatClass(label)} ${isBooked ? "cursor-pointer hover:ring-2 hover:ring-red-500" : ""} ${highlightedSeat === label ? "relative z-10 ring-4 ring-amber-400 ring-offset-2" : ""}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">{trip.busNo || trip.busId}</span>
        <span className="text-muted-foreground">{trip.route?.startStop || "Start"} → {trip.route?.endStop || "Destination"}</span>
        <span className="ml-auto text-muted-foreground">{loading ? "Refreshing..." : "Live"}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">Available: {loading ? "—" : seatCount - occupiedCount}</span>
        <span className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-red-800">Booked: {loading ? "—" : occupiedCount}</span>
        <span className="rounded-md border px-3 py-1.5">Total: {seatCount}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border-2 border-muted bg-muted/20 p-4">
        <div className="mx-auto min-w-max max-w-fit">
          <div className="mb-4 flex items-center justify-between border-b border-dashed pb-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Driver</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Front</span>
            {hasFrontSingle ? seat("C") : <span className="w-9" />}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: maxRows }, (_, row) => (
                <div key={`left-${row}`} className="flex gap-1">
                  {Array.from({ length: leftColumns }, (_, column) => row < leftRows
                    ? seat(getSeatNumber(row, column))
                    : <span key={`empty-left-${row}-${column}`} className="h-9 w-9" />)}
                </div>
              ))}
            </div>
            <span className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ writingMode: "vertical-rl" }}>Aisle</span>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: maxRows }, (_, row) => (
                <div key={`right-${row}`} className="flex gap-1">
                  {Array.from({ length: rightColumns }, (_, column) => row < rightRows
                    ? seat(getSeatNumber(row, leftColumns + column))
                    : <span key={`empty-right-${row}-${column}`} className="h-9 w-9" />)}
                </div>
              ))}
            </div>
          </div>
          {hasBackFullRow && (
            <div className="mt-4 flex justify-center gap-1 border-t border-dashed pt-3">
              {Array.from({ length: backRowSeats }, (_, column) => seat(getBackSeatNumber(column)))}
            </div>
          )}
          <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rear</p>
        </div>
      </div>
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