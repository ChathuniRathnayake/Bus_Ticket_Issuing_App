import { useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Pencil, Trash2, Calendar, Plus, Search } from "lucide-react";

export default function ManageSchedules() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    scheduleId: "",
    busId: "",
    routeId: "",
    date: "",
    departureTime: "",
    status: "",
  });

  const token = localStorage.getItem("token");

  const loadData = useCallback(async () => {
      try {
        if (!token) {
          navigate("/admin-login");
          return;
        }

        setLoading(true);

        const [scheduleRes, busRes, routeRes] = await Promise.all([
          axios.get("http://localhost:5000/api/schedule", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/route", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const busesData = busRes.data;
        const routesData = routeRes.data;

        setBuses(busesData);
        setRoutes(routesData);

        const enrichedSchedules = scheduleRes.data.map((schedule) => {
          const bus = busesData.find((b) => b.id === schedule.busId);
          const route = routesData.find(
            (r) => r.routeId === schedule.routeId || r.id === schedule.routeId
          );

          return {
            ...schedule,
            busNo: bus?.busNo || "Unknown",
            routeName: route
              ? `${route.startStop} → ${route.endStop}`
              : "Unknown",
            routeDistance: route?.distance || "-",
            routeDuration: route?.duration || "-",
            routeStops: Array.isArray(route?.stops)
              ? route.stops.map((stop) => typeof stop === "string" ? stop : stop.name).join(" → ")
              : "Stops not configured",
          };
        });

        enrichedSchedules.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.departureTime}`);
          const dateB = new Date(`${b.date}T${b.departureTime}`);
          return dateA - dateB;
        });

        setSchedules(enrichedSchedules);

      } catch (error) {
        console.error(error);
        alert("Failed to load schedules");
      } finally {
        setLoading(false);
      }
  }, [navigate, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // EDIT
  const handleEdit = (schedule) => {
    setEditId(schedule.id);
    setForm({
      scheduleId: schedule.scheduleId,
      busId: schedule.busId,
      routeId: schedule.routeId,
      date: schedule.date,
      departureTime: schedule.departureTime,
      status: schedule.status,
    });
  };

  // SAVE
  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/schedule/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditId(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update schedule");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete schedule");
    }
  };

  const visibleSchedules = schedules.filter((schedule) =>
    [schedule.scheduleId, schedule.busNo, schedule.routeName, schedule.date, schedule.status]
      .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="h-10 gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold">Manage Schedules</h2>
          <Button onClick={() => navigate("/admin-dashboard/add-schedule")} className="gap-2">
            <Plus className="h-4 w-4" /> Add Schedule
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schedules..."
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedules ({visibleSchedules.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : visibleSchedules.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="mx-auto mb-4 opacity-50" />
              <p>No schedules found</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleSchedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.scheduleId}</TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <select
                            value={form.busId}
                            onChange={(e) =>
                              setForm({ ...form, busId: e.target.value })
                            }
                            className="h-9 rounded-md border border-input bg-background px-2"
                          >
                            {buses.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.busNo}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${s.busNo}`
                        )}
                      </TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <select
                            value={form.routeId}
                            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                            className="h-9 max-w-56 rounded-md border border-input bg-background px-2"
                          >
                            {routes.map((route) => (
                              <option key={route.id} value={route.id}>
                                {route.routeName || `${route.startStop} → ${route.endStop}`}
                              </option>
                            ))}
                          </select>
                        ) : <div className="font-medium">{s.routeName}</div>}
                        {editId !== s.id && (
                          <>
                        <div className="mt-1 max-w-sm whitespace-normal text-xs text-muted-foreground">{s.routeStops}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.routeDistance !== "-" ? `${s.routeDistance} km · ` : ""}
                          {s.routeDuration !== "-" ? `${s.routeDuration} estimated` : ""}
                        </div>
                          </>
                        )}
                      </TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <Input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                              setForm({ ...form, date: e.target.value })
                            }
                          />
                        ) : (
                          s.date
                        )}
                      </TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <Input
                            type="time"
                            value={form.departureTime}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                departureTime: e.target.value,
                              })
                            }
                          />
                        ) : (
                          s.departureTime
                        )}
                      </TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="h-9 rounded-md border border-input bg-background px-2"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : s.status}
                      </TableCell>

                      <TableCell className="flex gap-2">
                        {editId === s.id ? (
                          <Button onClick={() => handleSave(s.id)}>Save</Button>
                        ) : (
                          <Button onClick={() => handleEdit(s)}>
                            <Pencil size={16} />
                          </Button>
                        )}

                        <Button
                          className="bg-red-600 text-white"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 size={16} />
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