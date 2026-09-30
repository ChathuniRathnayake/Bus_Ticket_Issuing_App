import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2, Bus, Search, Users, Route, Activity } from "lucide-react";

export default function ManageBuses() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    busNo: "",
    routeId: "",
    totalSeats: "",
    status: "",
  });

  const token = localStorage.getItem("token");

  // FETCH ALL BUSES AND ROUTES
  const fetchBuses = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [busRes, routeRes] = await Promise.all([
        axios.get("/api/bus", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/route", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      // Merge bus data with route data and sort by date and time
      const busesWithRoutes = busRes.data.map((bus) => {
        const route = routeRes.data.find((r) => r.routeId === bus.routeId);
        return {
          ...bus,
          routeDate: route?.date || "",
          routeTime: route?.startTime || "",
          routeName: route ? `${route.startStop} → ${route.endStop}` : "Unknown",
        };
      });
      
      // Sort by date and time in ascending order
      busesWithRoutes.sort((a, b) => {
        const dateA = new Date(`${a.routeDate}T${a.routeTime}`);
        const dateB = new Date(`${b.routeDate}T${b.routeTime}`);
        return dateA - dateB;
      });
      
      setBuses(busesWithRoutes);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load once when the admin page opens.
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

    fetchBuses();
  }, [fetchBuses, navigate, token]);

  const filteredBuses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return buses;
    return buses.filter((bus) => [bus.id, bus.busNo, bus.routeId, bus.routeName]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [buses, search]);

  const activeCount = buses.filter((bus) => bus.status === "Active").length;
  const seatCount = buses.reduce((total, bus) => total + Number(bus.totalSeats || 0), 0);

  const handleEdit = (bus) => {
    setEditId(bus.id);
    setForm({
      busNo: bus.busNo,
      routeId: bus.routeId,
      totalSeats: bus.totalSeats,
      status: bus.status,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `/api/bus/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBuses();
      setEditId(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update bus");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this bus?")) return;

    try {
      await axios.delete(`/api/bus/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBuses();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete bus");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Fleet operations</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Bus registry</h2>
          <p className="mt-1 text-sm text-slate-500">Maintain fleet identity, capacity, routes, and service status.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="h-10 gap-2 self-start lg:self-auto"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Registered buses", value: buses.length, icon: Bus, tone: "blue" },
          { label: "Active service", value: activeCount, icon: Activity, tone: "emerald" },
          { label: "Total seats", value: seatCount, icon: Users, tone: "amber" },
        ].map((metric) => {
          const Icon = metric.icon;
          const toneClass = metric.tone === "blue" ? "bg-blue-50 text-blue-600" : metric.tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600";
          return (
          <div key={metric.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{metric.value}</p></div>
          </div>
          );
        })}
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Fleet records</CardTitle><p className="mt-1 text-sm text-slate-500">{filteredBuses.length} of {buses.length} records</p></div>
          <div className="relative w-full sm:w-80"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, bus number, or route" className="h-10 pl-9" /></div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12">Loading...</p>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No buses found.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                    <TableHead>Fleet ID</TableHead>
                    <TableHead>Bus number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Total Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBuses.map((bus) => (
                    <TableRow
                      key={bus.id}
                      className="even:bg-muted/50 hover:bg-muted"
                    >
                      <TableCell><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{bus.id}</span></TableCell>
                      <TableCell>
                        {editId === bus.id ? (
                          <Input
                            value={form.busNo}
                            onChange={(e) =>
                              setForm({ ...form, busNo: e.target.value })
                            }
                          />
                        ) : (
                          <span className="font-semibold text-slate-950">{bus.busNo || "Unassigned"}</span>
                        )}
                      </TableCell>
                      <TableCell><div className="flex items-center gap-2"><Route className="h-4 w-4 text-blue-500" /><span>{bus.routeName || "No route assigned"}</span></div><span className="ml-6 font-mono text-xs text-slate-400">{bus.routeId || "—"}</span></TableCell>
                      <TableCell>
                        {editId === bus.id ? (
                          <Input
                            type="number"
                            value={form.totalSeats}
                            onChange={(e) =>
                              setForm({ ...form, totalSeats: e.target.value })
                            }
                          />
                        ) : (
                          <span className="font-semibold">{bus.totalSeats || 0}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === bus.id ? (
                          <Input
                            value={form.status}
                            onChange={(e) =>
                              setForm({ ...form, status: e.target.value })
                            }
                          />
                        ) : (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${bus.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{bus.status || "Unknown"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editId === bus.id ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(bus.id)}
                            className="bg-blue-600 text-white"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(bus)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleDelete(bus.id)}
                          className="bg-red-600 text-white"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
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