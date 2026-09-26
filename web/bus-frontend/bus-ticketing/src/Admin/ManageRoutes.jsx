import { Fragment, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Map, ArrowUp, ArrowDown, Plus, Search, Route as RouteIcon } from "lucide-react";

export default function ManageRoutes() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [stopText, setStopText] = useState("");
  const [editingStops, setEditingStops] = useState([]);
  const [stopRecords, setStopRecords] = useState([]);

  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    date: "",
    duration: "",
  });

  // Auto-calculate end time based on start time + duration
  const calculateEndTime = (startTime, durationStr) => {
    if (!startTime || !durationStr) return "";
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [durHours, durMinutes] = durationStr.split(":").map(Number);
    let endHours = startHours + durHours;
    let endMinutes = startMinutes + durMinutes;
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    endHours = endHours % 24;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  /* =====================================================
     FETCH ROUTES
  ===================================================== */
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/route",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRoutes(res.data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA - dateB;
      }));

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */
  useEffect(() => {
    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    // Optional: Check if token looks valid (basic check)
    if (token.length < 100) {
      alert("Invalid token. Please login again.");
      navigate("/admin-login");
      return;
    }

    fetchRoutes();
  }, [fetchRoutes, navigate, token]);

  /* =====================================================
     EDIT
  ===================================================== */
  const handleEdit = (route) => {
    setEditId(route.id);
    const stops = Array.isArray(route.stops) && route.stops.length
      ? route.stops.map((stop, sequence) => typeof stop === "string"
        ? { stopId: `${route.routeId}-${sequence + 1}`, name: stop, sequence, stopType: "normal_road_waypoint", boardingAllowed: sequence === 0, alightingAllowed: sequence === route.stops.length - 1 }
        : { ...stop })
      : [
        { stopId: `${route.routeId}-origin`, name: route.startStop, sequence: 0, stopType: "terminal", boardingAllowed: true, alightingAllowed: false },
        { stopId: `${route.routeId}-destination`, name: route.endStop, sequence: 1, stopType: "terminal", boardingAllowed: false, alightingAllowed: true },
      ];
    setEditingStops(stops);
    setStopText(stops.map((stop) => `${stop.name} | ${stop.stopType || "normal_road_waypoint"} | ${stop.boardingAllowed === true} | ${stop.alightingAllowed === true}`).join("\n"));
    setStopRecords(Array.isArray(route.stops) && route.stops.length
      ? route.stops.map((stop, index) => typeof stop === "string"
        ? { stopId: `${route.routeId}-${index + 1}`, name: stop, stopType: "normal_road_waypoint", boardingAllowed: index === 0, alightingAllowed: index === route.stops.length - 1 }
        : { ...stop })
      : [
        { stopId: `${route.routeId}-origin`, name: route.startStop, stopType: "terminal", boardingAllowed: true, alightingAllowed: false },
        { stopId: `${route.routeId}-destination`, name: route.endStop, stopType: "terminal", boardingAllowed: false, alightingAllowed: true },
      ]);
    setForm({
      startTime: route.startTime || "",
      endTime: route.endTime || "",
      date: route.date || "",
      duration: route.duration || "",
    });
  };

  /* =====================================================
     UPDATE ROUTE
  ===================================================== */
  const handleSave = async (id) => {
    try {
      const stops = stopText.split("\n").map((line) => line.trim()).filter(Boolean).map((line, sequence) => {
        const [name, stopType = "normal_road_waypoint", boarding = "false", alighting = "false"] = line.split("|").map((part) => part.trim());
        const preservedId = editingStops.find((stop) => stop.name === name)?.stopId || editingStops[sequence]?.stopId;
        const isExpresswayElement = stopType === "expressway_interchange" || stopType === "expressway_segment";
        return {
          stopId: preservedId,
          name,
          sequence,
          stopType,
          boardingAllowed: !isExpresswayElement && boarding.toLowerCase() === "true",
          alightingAllowed: !isExpresswayElement && alighting.toLowerCase() === "true",
        };
      });
      if (stops.length < 2 || stops.some((stop) => !stop.name)) {
        throw new Error("Add at least two named stops in route order");
      }
      const updateData = {
        startTime: form.startTime,
        endTime: form.endTime,
        date: form.date,
          stops,
      };
      
      await axios.put(
        `http://localhost:5000/api/route/${id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Route updated successfully");
      setEditId(null);
      setEditingStops([]);
      setStopText("");
      setStopRecords([]);
      fetchRoutes();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update route");
    }
  };

  /* =====================================================
     DELETE ROUTE
  ===================================================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/route/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Route deleted successfully");
      fetchRoutes();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete route");
    }
  };

  /* =====================================================
     FILTERED ROUTES (SEARCH)
  ===================================================== */
  const filteredRoutes = routes.filter((r) =>
    r.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    r.routeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="h-10 gap-2 hover:bg-muted transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>

          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Network planning</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Route registry</h2><p className="mt-1 text-sm text-slate-500">Manage corridors, ordered stops, permissions, and timing metadata.</p></div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-72 pl-9"
          />
        </div>

      </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">

        <CardHeader>
          <CardTitle className="flex items-center gap-2"><RouteIcon className="h-5 w-5 text-emerald-600" /> Routes <span className="text-sm font-normal text-slate-500">({filteredRoutes.length})</span></CardTitle>
        </CardHeader>

        <CardContent>

          {loading ? (
            <p className="text-center py-12 text-muted-foreground">
              Loading...
            </p>
          ) : filteredRoutes.length === 0 ? (

            <div className="text-center py-12">
              <Map className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No routes found.
              </p>
            </div>

          ) : (

            <div className="overflow-auto rounded-xl border border-border">

              <Table>

                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Route ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Stop</TableHead>
                    <TableHead>End Stop</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {filteredRoutes.map((r) => (
                    <Fragment key={r.id}>
                    <TableRow
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >

                      <TableCell><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{r.routeId}</span></TableCell>
                      <TableCell>
                        <div className="font-medium">{r.routeName}</div>
                        {editId === r.id ? (
                          <div className="mt-2 space-y-1">
                            <label htmlFor={`stops-${r.id}`} className="text-xs font-medium text-slate-600">Ordered stops: name | type | boarding | alighting</label>
                            <textarea
                              id={`stops-${r.id}`}
                              value={stopText}
                              onChange={(event) => setStopText(event.target.value)}
                              className="min-h-36 w-full rounded border border-slate-300 bg-white p-2 text-xs"
                            />
                          </div>
                        ) : Array.isArray(r.stops) && r.stops.length > 0 && (
                          <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {r.stops.map((stop, index) => {
                              const stopName = typeof stop === "string" ? stop : stop.name;
                              const stopType = typeof stop === "string" ? "stop" : stop.stopType;
                              return (
                                <li key={typeof stop === "string" ? `${r.id}-${index}` : stop.stopId}>
                                  {index + 1}. {stopName} <span className="text-slate-400">({stopType})</span>
                                </li>
                              );
                            })}
                          </ol>
                        )}
                      </TableCell>
                      <TableCell>{r.startStop}</TableCell>
                      <TableCell>{r.endStop}</TableCell>
                      <TableCell>{r.distance}</TableCell>
                      <TableCell>{r.duration}</TableCell>
                      <TableCell><span className="font-medium text-slate-800">{r.startStop}</span></TableCell>
                      <TableCell><span className="font-medium text-slate-800">{r.endStop}</span></TableCell>
                      <TableCell>{r.distance || "—"}</TableCell>
                      <TableCell><span className="font-mono text-sm">{r.duration || "—"}</span></TableCell>

                      {/* Date */}
                      <TableCell>
                        {editId === r.id ? (
                          <Input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                              setForm({ ...form, date: e.target.value })
                            }
                          />
                        ) : (
                          r.date || "-"
                        )}
                      </TableCell>

                      {/* Start Time */}
                      <TableCell>
                        {editId === r.id ? (
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => {
                              const newStartTime = e.target.value;
                              const calculatedEndTime = calculateEndTime(newStartTime, form.duration);
                              setForm({
                                ...form,
                                startTime: newStartTime,
                                endTime: calculatedEndTime,
                              });
                            }}
                          />
                        ) : (
                          r.startTime || "-"
                        )}
                      </TableCell>

                      {/* End Time */}
                      <TableCell>
                        {editId === r.id ? (
                          <Input
                            type="time"
                            value={form.endTime}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        ) : (
                          r.endTime || "-"
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                        {editId === r.id ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(r.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(r)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleDelete(r.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        </div>
                      </TableCell>

                    </TableRow>
                    {editId === r.id && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-slate-50">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ordered route stops</p>
                            {stopRecords.map((stop, index) => (
                              <div key={stop.stopId} className="grid grid-cols-1 items-center gap-2 rounded border bg-white p-2 md:grid-cols-[minmax(12rem,1fr)_12rem_auto_auto_auto]">
                                <Input aria-label={`Stop ${index + 1} name`} value={stop.name} onChange={(event) => setStopRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
                                <select aria-label={`Stop ${index + 1} type`} value={stop.stopType || "normal_road_waypoint"} onChange={(event) => setStopRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, stopType: event.target.value, boardingAllowed: event.target.value.startsWith("expressway_") ? false : item.boardingAllowed, alightingAllowed: event.target.value.startsWith("expressway_") ? false : item.alightingAllowed } : item))} className="h-10 rounded border border-slate-300 bg-white px-2 text-sm">
                                  <option value="terminal">Terminal</option>
                                  <option value="normal_road_waypoint">Normal road stop</option>
                                  <option value="expressway_interchange">Expressway interchange</option>
                                  <option value="expressway_segment">Expressway segment</option>
                                </select>
                                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={stop.boardingAllowed === true} disabled={stop.stopType?.startsWith("expressway_")} onChange={(event) => setStopRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, boardingAllowed: event.target.checked } : item))} />Board</label>
                                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={stop.alightingAllowed === true} disabled={stop.stopType?.startsWith("expressway_")} onChange={(event) => setStopRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, alightingAllowed: event.target.checked } : item))} />Alight</label>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" title="Move stop up" disabled={index === 0} onClick={() => setStopRecords((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}><ArrowUp className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="ghost" title="Move stop down" disabled={index === stopRecords.length - 1} onClick={() => setStopRecords((items) => { const next = [...items]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })}><ArrowDown className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="ghost" title="Remove stop" disabled={stopRecords.length <= 2} onClick={() => setStopRecords((items) => items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => setStopRecords((items) => {
                              const next = [...items];
                              next.splice(Math.max(1, next.length - 1), 0, { stopId: `${r.routeId}-stop-${Date.now()}`, name: "", stopType: "normal_road_waypoint", boardingAllowed: false, alightingAllowed: false });
                              return next;
                            })}><Plus className="mr-1 h-4 w-4" />Add stop</Button>
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