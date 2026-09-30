// src/Passenger/SearchBuses.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLkr, journeyFareCents } from "@/utils/fare";
import { ArrowLeft, Bus, Filter, Calendar, Clock, MapPin, Search } from "lucide-react";

export default function SearchBuses() {
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const [startStopFilter, setStartStopFilter] = useState("");
  const [endStopFilter, setEndStopFilter] = useState("");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [busRes, routeRes, scheduleRes] = await Promise.all([
          fetch("/api/bus/available", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/route/available", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/schedule/available", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [busData, routeData, scheduleData] = await Promise.all([
          busRes.json(),
          routeRes.json(),
          scheduleRes.json(),
        ]);

        if (!busRes.ok) throw new Error(busData.message || "Failed to load buses");
        if (!routeRes.ok) throw new Error(routeData.message || "Failed to load routes");
        if (!scheduleRes.ok) throw new Error(scheduleData.message || "Failed to load schedules");

        setBuses(busData);
        setRoutes(routeData);
        setSchedules(scheduleData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert(error.message || "Failed to load available buses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const activeTrips = schedules
    .filter((schedule) => schedule.status === "Active")
    .map((schedule) => {
      const bus = buses.find((item) => (item.id || item.busId) === schedule.busId);
      const route = routes.find((item) => item.routeId === schedule.routeId);
      if (!bus || bus.status !== "Active" || !route) return null;

      return {
        ...bus,
        scheduleId: schedule.id || schedule.scheduleId,
        routeId: schedule.routeId,
        tripDate: schedule.date,
        departureTime: schedule.departureTime,
        route,
      };
    })
    .filter(Boolean)
    .filter((trip) => new Date(`${trip.tripDate}T${trip.departureTime}`) > currentTime);

  const getStops = (route) => {
    if (Array.isArray(route?.stops) && route.stops.length > 0) {
      return route.stops.map((stop, sequence) => typeof stop === "string"
        ? { stopId: `${route.routeId}-${sequence}`, name: stop, sequence, boardingAllowed: sequence === 0, alightingAllowed: sequence === route.stops.length - 1 }
        : { ...stop, sequence: Number.isInteger(stop.sequence) ? stop.sequence : sequence });
    }
    return [
      { stopId: `${route?.routeId}-origin`, name: route?.startStop, sequence: 0, boardingAllowed: true, alightingAllowed: false },
      { stopId: `${route?.routeId}-destination`, name: route?.endStop, sequence: 1, boardingAllowed: false, alightingAllowed: true },
    ];
  };

  const availableStartStops = useMemo(() => {
    const stops = activeTrips.flatMap((trip) => getStops(trip.route)
      .filter((stop) => stop.boardingAllowed === true)
      .map((stop) => stop.name)
      .filter(Boolean));
    return [...new Set(stops)].sort();
  }, [activeTrips]);

  const availableEndStops = useMemo(() => {
    const stops = activeTrips.flatMap((trip) => getStops(trip.route)
      .filter((stop) => stop.alightingAllowed === true)
      .map((stop) => stop.name)
      .filter(Boolean));
    return [...new Set(stops)].sort();
  }, [activeTrips]);

  const filteredBuses = activeTrips.filter((b) => {
    const route = b.route;
    const stops = getStops(route);
    const boardingStop = startStopFilter
      ? stops.find((stop) => stop.boardingAllowed === true && stop.name === startStopFilter)
      : null;
    const dropStop = endStopFilter
      ? stops.find((stop) => stop.alightingAllowed === true && stop.name === endStopFilter
        && (!boardingStop || stop.sequence > boardingStop.sequence))
      : null;
    const matchStart = !startStopFilter || Boolean(boardingStop);
    const matchEnd = !endStopFilter || Boolean(dropStop);
    const matchDate = !dateFilter || b.tripDate === dateFilter;

    let matchTime = true;
    if (startTimeFilter && b.departureTime) matchTime = matchTime && b.departureTime >= startTimeFilter;
    if (endTimeFilter && (route.endTime || b.departureTime)) {
      matchTime = matchTime && (route.endTime || b.departureTime) <= endTimeFilter;
    }

    if (!matchStart || !matchEnd || !matchTime || !matchDate) return false;
    b.boardingStop = boardingStop || stops.find((stop) => stop.boardingAllowed === true) || null;
    b.dropStop = dropStop || stops.find((stop) => stop.alightingAllowed === true) || null;
    return true;
  });

  const getRouteName = (routeId) => {
    const route = routes.find((r) => r.routeId === routeId);
    return route ? `${route.startStop} → ${route.endStop}` : "Unknown Route";
  };

  const selectClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white";

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
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Search Buses
          </h2>
          <p className="text-muted-foreground mt-0.5">Find and book your next journey across Sri Lanka</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 shadow-lg border border-blue-100 dark:border-zinc-700 bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Filter Your Journey</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-blue-500" /> From
              </Label>
              <select
                value={startStopFilter}
                onChange={(e) => setStartStopFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">All Starting Points</option>
                {availableStartStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> To
              </Label>
              <select
                value={endStopFilter}
                onChange={(e) => setEndStopFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">All Destinations</option>
                {availableEndStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-violet-500" /> Date
              </Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> After
              </Label>
              <Input
                type="time"
                value={startTimeFilter}
                onChange={(e) => setStartTimeFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-rose-500" /> Before
              </Label>
              <Input
                type="time"
                value={endTimeFilter}
                onChange={(e) => setEndTimeFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="shadow-xl border border-slate-100 dark:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-zinc-700 pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <Bus className="h-5 w-5 text-blue-600" />
            </div>
            Available Buses
          </CardTitle>
          <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
            {filteredBuses.length} found
          </span>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <p className="text-muted-foreground">Loading available buses...</p>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                <Search className="h-10 w-10 text-slate-300 dark:text-zinc-500" />
              </div>
              <p className="text-xl font-semibold text-slate-700 dark:text-zinc-300">No buses match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Clear a filter or choose another travel date to see more trips.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100 dark:border-zinc-700">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-800">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Bus ID</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Route</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Date</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Departure</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Seats</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Bus No</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-zinc-300">Fare</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600 dark:text-zinc-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map((b) => (
                    <TableRow key={b.scheduleId} className="hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-colors">
                      <TableCell className="font-medium text-slate-700 dark:text-zinc-300">{b.busId || b.id}</TableCell>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
                          {getRouteName(b.routeId)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">{b.tripDate}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Clock className="h-3 w-3" /> {b.departureTime}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">{b.totalSeats}</TableCell>
                      <TableCell className="font-medium text-slate-700 dark:text-zinc-300">{b.busNo}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {formatLkr(journeyFareCents(
                            b.route,
                            getStops(b.route),
                            b.boardingStop?.stopId,
                            b.dropStop?.stopId,
                          )) ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={() =>
                            navigate("/passenger-dashboard/seat-layout", {
                              state: { bus: b },
                            })
                          }
                        >
                          Book Now
                        </Button>
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