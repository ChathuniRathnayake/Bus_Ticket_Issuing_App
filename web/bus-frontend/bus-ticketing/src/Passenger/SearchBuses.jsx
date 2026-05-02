// src/Passenger/SearchBuses.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bus, Filter, Calendar, Clock } from "lucide-react";

export default function SearchBuses() {
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startStopFilter, setStartStopFilter] = useState("");
  const [endStopFilter, setEndStopFilter] = useState("");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const token = localStorage.getItem("token");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [busRes, routeRes] = await Promise.all([
          fetch("http://localhost:5000/api/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/route", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const busData = await busRes.json();
        const routeData = await routeRes.json();

        if (busRes.ok) setBuses(busData);
        if (routeRes.ok) setRoutes(routeData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load buses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const activeBuses = buses.filter((b) => b.status === "Active");

  const availableStartStops = useMemo(() => {
    const stops = activeBuses
      .map((b) => routes.find((r) => r.routeId === b.routeId)?.startStop)
      .filter(Boolean);
    return [...new Set(stops)].sort();
  }, [activeBuses, routes]);

  const availableEndStops = useMemo(() => {
    const stops = activeBuses
      .map((b) => routes.find((r) => r.routeId === b.routeId)?.endStop)
      .filter(Boolean);
    return [...new Set(stops)].sort();
  }, [activeBuses, routes]);

  const filteredBuses = activeBuses.filter((b) => {
    const route = routes.find((r) => r.routeId === b.routeId);
    if (!route) return false;

    const matchStart = !startStopFilter || route.startStop === startStopFilter;
    const matchEnd = !endStopFilter || route.endStop === endStopFilter;
    const matchDate = !dateFilter || route.date === dateFilter;

    let matchTime = true;
    if (startTimeFilter && route.startTime) matchTime = matchTime && route.startTime >= startTimeFilter;
    if (endTimeFilter && route.endTime) matchTime = matchTime && route.endTime <= endTimeFilter;

    return matchStart && matchEnd && matchTime && matchDate;
  });

  const getRouteName = (routeId) => {
    const route = routes.find((r) => r.routeId === routeId);
    return route ? `${route.startStop} → ${route.endStop}` : "Unknown Route";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/passenger-dashboard")}
          className="h-11 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Button>
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Search Buses
          </h2>
          <p className="text-muted-foreground">Find and book your next journey</p>
        </div>
      </div>

      {/* Filters - Colorful Card */}
      <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-slate-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-5">
            <Filter className="h-6 w-6 text-purple-600" />
            <h3 className="text-2xl font-semibold text-gray-800">Filter Your Journey</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">From</Label>
              <select
                value={startStopFilter}
                onChange={(e) => setStartStopFilter(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Starting Points</option>
                {availableStartStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">To</Label>
              <select
                value={endStopFilter}
                onChange={(e) => setEndStopFilter(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Destinations</option>
                {availableEndStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">After</Label>
              <Input
                type="time"
                value={startTimeFilter}
                onChange={(e) => setStartTimeFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Before</Label>
              <Input
                type="time"
                value={endTimeFilter}
                onChange={(e) => setEndTimeFilter(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-purple-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Bus className="h-7 w-7 text-purple-600" />
            Available Buses ({filteredBuses.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-20 text-lg text-muted-foreground">
              Loading available buses...
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-20">
              <Bus className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-xl text-gray-600">No buses found for your filters</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold">Bus ID</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Departure</TableHead>
                    <TableHead className="font-semibold">Seats</TableHead>
                    <TableHead className="font-semibold">Bus No</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map((b, i) => (
                    <TableRow key={i} className="hover:bg-blue-50/50 transition-all">
                      <TableCell className="font-medium">{b.busId || b.id}</TableCell>
                      <TableCell className="font-medium">{getRouteName(b.routeId)}</TableCell>
                      <TableCell>{routes.find(r => r.routeId === b.routeId)?.date}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        {routes.find(r => r.routeId === b.routeId)?.startTime}
                      </TableCell>
                      <TableCell>{b.totalSeats}</TableCell>
                      <TableCell className="font-medium">{b.busNo}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
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