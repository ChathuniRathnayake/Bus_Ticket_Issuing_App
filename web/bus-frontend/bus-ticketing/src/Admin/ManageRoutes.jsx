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

const MAX_VISIBLE_STOPS = 5;
const EXPRESSWAY_TYPES = ["expressway_interchange", "expressway_segment"];
const DURATION_PATTERN = /^\d+:[0-5]?\d$/;

const emptyEditForm = { routeName: "", startStop: "", endStop: "", distance: "", duration: "" };

const formatFare = (priceCents) => {
  const cents = Number(priceCents);
  if (!Number.isFinite(cents) || cents <= 0) return "—";
  return `Rs ${(cents / 100).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Normalize a route's stops into objects, falling back to the two terminals.
function toStopList(route) {
  if (!Array.isArray(route.stops) || route.stops.length === 0) {
    return [
      { stopId: `${route.routeId}-origin`, name: route.startStop, stopType: "terminal", boardingAllowed: true, alightingAllowed: false },
      { stopId: `${route.routeId}-destination`, name: route.endStop, stopType: "terminal", boardingAllowed: false, alightingAllowed: true },
    ];
  }
  return route.stops.map((stop, index) => typeof stop === "string"
    ? { stopId: `${route.routeId}-${index + 1}`, name: stop, stopType: "normal_road_waypoint", boardingAllowed: index === 0, alightingAllowed: index === route.stops.length - 1 }
    : { ...stop });
}

export default function ManageRoutes() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [stopRecords, setStopRecords] = useState([]);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editPriceLkr, setEditPriceLkr] = useState("");
  const [expanded, setExpanded] = useState({});

  /* =====================================================
     FETCH ROUTES
  ===================================================== */
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/route",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoutes(res.data.sort((a, b) =>
        String(a.routeName || a.routeId || "").localeCompare(String(b.routeName || b.routeId || ""))
      ));

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
    setStopRecords(toStopList(route));
    setEditForm({
      routeName: route.routeName || "",
      startStop: route.startStop || "",
      endStop: route.endStop || "",
      distance: route.distance !== undefined && route.distance !== null ? String(route.distance) : "",
      duration: route.duration || "",
    });
    setEditPriceLkr(Number.isFinite(Number(route.priceCents)) ? String(Number(route.priceCents) / 100) : "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setStopRecords([]);
    setEditForm(emptyEditForm);
    setEditPriceLkr("");
  };

  /* =====================================================
     UPDATE ROUTE
  ===================================================== */
  const handleSave = async (id) => {
    try {
      const stops = stopRecords.map((stop, sequence) => {
        const isExpressway = EXPRESSWAY_TYPES.includes(stop.stopType);
        return {
          stopId: stop.stopId,
          name: (stop.name || "").trim(),
          sequence,
          stopType: stop.stopType || "normal_road_waypoint",
          boardingAllowed: !isExpressway && stop.boardingAllowed === true,
          alightingAllowed: !isExpressway && stop.alightingAllowed === true,
        };
      });

      if (stops.length < 2 || stops.some((stop) => !stop.name)) {
        throw new Error("Add at least two named stops in route order");
      }

      const payload = { stops };
      const routeName = editForm.routeName.trim();
      const startStop = editForm.startStop.trim();
      const endStop = editForm.endStop.trim();
      const distance = editForm.distance.trim();
      const duration = editForm.duration.trim();

      if (routeName) payload.routeName = routeName;
      if (startStop) payload.startStop = startStop;
      if (endStop) payload.endStop = endStop;
      if (distance) payload.distance = distance;
      if (duration) {
        if (!DURATION_PATTERN.test(duration)) {
          throw new Error("Duration must be in H:MM format, e.g. 2:30");
        }
        payload.duration = duration;
      }

      const fareTrimmed = String(editPriceLkr ?? "").trim();
      if (fareTrimmed !== "") {
        const rupees = Number(fareTrimmed);
        if (!Number.isFinite(rupees) || rupees < 0) {
          throw new Error("Fare must be a non-negative amount in rupees");
        }
        payload.priceCents = Math.round(rupees * 100);
      }

      await axios.put(
        `http://localhost:5000/api/route/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Route updated successfully");
      cancelEdit();
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Network planning</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Route registry</h2>
            <p className="mt-1 text-sm text-slate-500">Manage corridors, ordered stops, and boarding permissions.</p>
          </div>
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
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-emerald-600" /> Routes <span className="text-sm font-normal text-slate-500">({filteredRoutes.length})</span>
          </CardTitle>
        </CardHeader>

        <CardContent>

          {loading ? (
            <p className="text-center py-12 text-muted-foreground">Loading...</p>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-12">
              <Map className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No routes found.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">

              <Table>

                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Route ID</TableHead>
                    <TableHead>Name &amp; stops</TableHead>
                    <TableHead>Start Stop</TableHead>
                    <TableHead>End Stop</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {filteredRoutes.map((r) => {
                    const stops = toStopList(r);
                    const intermediate = stops.slice(1, -1);
                    const visible = expanded[r.id] ? intermediate : intermediate.slice(0, MAX_VISIBLE_STOPS);
                    const hiddenCount = intermediate.length - MAX_VISIBLE_STOPS;

                    return (
                      <Fragment key={r.id}>
                        <TableRow className="even:bg-muted/50 hover:bg-muted transition-all duration-300 align-top">

                          <TableCell>
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{r.routeId}</span>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-slate-900">{r.routeName}</div>

                            {editId !== r.id && intermediate.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1">
                                {visible.map((stop, index) => (
                                  <span
                                    key={stop.stopId || `${r.id}-stop-${index}`}
                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                                  >
                                    {stop.name}
                                  </span>
                                ))}
                                {hiddenCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpanded(r.id)}
                                    className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    {expanded[r.id] ? "Show less" : `+${hiddenCount} more`}
                                  </button>
                                )}
                              </div>
                            )}

                            {editId !== r.id && intermediate.length === 0 && (
                              <div className="mt-1 text-xs text-slate-400">Direct — no intermediate stops</div>
                            )}
                          </TableCell>

                          <TableCell>{r.startStop}</TableCell>
                          <TableCell>{r.endStop}</TableCell>
                          <TableCell>{r.distance ? r.distance : "—"}</TableCell>
                          <TableCell><span className="font-mono text-sm">{r.duration || "—"}</span></TableCell>
                          <TableCell>
                            <span className="font-semibold text-emerald-700">{formatFare(r.priceCents)}</span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">

                              {editId === r.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(r.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit(r)}>
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
                            <TableCell colSpan={8} className="bg-slate-50">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Route details</p>
                                  <div className="grid grid-cols-1 gap-3 rounded border bg-white p-3 md:grid-cols-[repeat(6,minmax(0,1fr))]">
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">Route name</label>
                                      <Input value={editForm.routeName} onChange={(event) => setEditForm((prev) => ({ ...prev, routeName: event.target.value }))} className="w-full min-w-0" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">Start stop</label>
                                      <Input value={editForm.startStop} onChange={(event) => setEditForm((prev) => ({ ...prev, startStop: event.target.value }))} className="w-full min-w-0" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">End stop</label>
                                      <Input value={editForm.endStop} onChange={(event) => setEditForm((prev) => ({ ...prev, endStop: event.target.value }))} className="w-full min-w-0" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">Distance (km)</label>
                                      <Input type="number" min="0.1" step="0.1" value={editForm.distance} onChange={(event) => setEditForm((prev) => ({ ...prev, distance: event.target.value }))} className="w-full min-w-0" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">Duration (H:MM)</label>
                                      <Input value={editForm.duration} onChange={(event) => setEditForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="2:30" className="w-full min-w-0" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <label className="block text-xs font-medium text-slate-600">Fare (LKR)</label>
                                      <Input type="number" min="0" step="0.01" value={editPriceLkr} onChange={(event) => setEditPriceLkr(event.target.value)} placeholder="450" className="w-full min-w-0" />
                                    </div>
                                  </div>
                                </div>

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
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}

                </TableBody>

              </Table>

            </div>
          )}

        </CardContent>

      </Card>

    </div>
  );
}
