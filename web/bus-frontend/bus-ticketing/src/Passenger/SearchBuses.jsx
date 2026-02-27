import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bus, Filter } from "lucide-react";

export default function SearchBuses({ buses, routes }) {
  const navigate = useNavigate();

  // Filters
  const [startStopFilter, setStartStopFilter] = useState("");
  const [endStopFilter, setEndStopFilter] = useState("");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");

  // Get only active buses
  const activeBuses = buses.filter((b) => b.status === "Active");

  // Get unique start/end stops from active buses only
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

  // Filtered buses
  const filteredBuses = activeBuses.filter((b) => {
    const route = routes.find((r) => r.routeId === b.routeId);
    if (!route) return false;

    const matchStart = !startStopFilter || route.startStop === startStopFilter;
    const matchEnd = !endStopFilter || route.endStop === endStopFilter;

    // Time filter placeholder (add real logic when buses have times)
    let matchTime = true;
    if (startTimeFilter || endTimeFilter) {
      // Example: later compare route.startTime / endTime
      // For now always true
    }

    return matchStart && matchEnd && matchTime;
  });

  const getRouteName = (routeId) => {
    const route = routes.find((r) => r.routeId === routeId);
    return route ? `${route.startStop} → ${route.endStop}` : "Unknown Route";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/passenger-dashboard")}
            className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Available Buses</h2>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filter Buses</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startStopFilter" className="text-sm font-medium">Start Stop</Label>
              <select
                id="startStopFilter"
                value={startStopFilter}
                onChange={(e) => setStartStopFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={availableStartStops.length === 0}
              >
                <option value="">All Start Stops</option>
                {availableStartStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="endStopFilter" className="text-sm font-medium">End Stop</Label>
              <select
                id="endStopFilter"
                value={endStopFilter}
                onChange={(e) => setEndStopFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={availableEndStops.length === 0}
              >
                <option value="">All End Stops</option>
                {availableEndStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="startTime" className="text-sm font-medium">Depart After</Label>
              <Input
                id="startTime"
                type="time"
                value={startTimeFilter}
                onChange={(e) => setStartTimeFilter(e.target.value)}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="text-sm font-medium">Arrive Before</Label>
              <Input
                id="endTime"
                type="time"
                value={endTimeFilter}
                onChange={(e) => setEndTimeFilter(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buses Table */}
      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Active Buses ({filteredBuses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBuses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active buses match your filters or available yet.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Bus Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map((b, i) => (
                    <TableRow key={i} className="even:bg-muted/50 hover:bg-muted transition-all duration-300">
                      <TableCell>{b.busId}</TableCell>
                      <TableCell>{getRouteName(b.routeId)}</TableCell>
                      <TableCell>{b.totalSeats}</TableCell>
                      <TableCell>{b.busNo}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"}`}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigate("/passenger-dashboard/seat-layout", { state: { bus: b } })}
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