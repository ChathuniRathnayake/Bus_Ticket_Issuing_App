import { useState, useEffect } from "react";
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
import { ArrowLeft, Pencil, Trash2, Calendar } from "lucide-react";

export default function ManageSchedules({ buses, routes, schedules, setSchedules }) {
  const navigate = useNavigate();
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
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const token = localStorage.getItem("token");

  // FETCH ALL SCHEDULES
  const fetchSchedules = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Merge schedule data with bus and route data
      const schedulesWithDetails = res.data.map((schedule) => {
        const bus = buses.find((b) => b.busId === schedule.busId);
        const route = routes.find((r) => r.routeId === schedule.routeId);

        return {
          ...schedule,
          busNo: bus?.busNo || "Unknown",
          routeName: route ? `${route.startStop} → ${route.endStop}` : "Unknown",
          routeDistance: route?.distance || "",
          routeDuration: route?.duration || "",
        };
      });

      // Sort by date and time in ascending order
      schedulesWithDetails.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.departureTime}`);
        const dateB = new Date(`${b.date}T${b.departureTime}`);
        return dateA - dateB;
      });

      setSchedules(schedulesWithDetails);
      setFilteredSchedules(schedulesWithDetails);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

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

    fetchSchedules();
  }, [navigate, buses, routes]);

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

  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/schedule/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSchedules();
      setEditId(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete schedule");
    }
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="h-10 gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Schedules</h2>
        <Input
          placeholder="Search schedules..."
          className="w-64 h-10"
          onChange={(e) => {
            const query = e.target.value.toLowerCase();
            setFilteredSchedules(
              schedules.filter((s) =>
                s.scheduleId.toLowerCase().includes(query) ||
                s.busNo.toLowerCase().includes(query) ||
                s.routeName.toLowerCase().includes(query) ||
                s.date.includes(query) ||
                s.departureTime.includes(query)
              )
            );
          }}
        />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Schedules ({filteredSchedules.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12">Loading...</p>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No schedules found.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Schedule ID</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Departure Time</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow
                      key={schedule.id}
                      className="even:bg-muted/50 hover:bg-muted"
                    >
                      <TableCell>{schedule.scheduleId}</TableCell>
                      <TableCell>
                        {editId === schedule.id ? (
                          <select
                            name="busId"
                            value={form.busId}
                            onChange={(e) => setForm({ ...form, busId: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">-- Select Bus --</option>
                            {buses.map((bus) => (
                              <option key={bus.busId} value={bus.busId}>
                                {bus.busNo} (ID: {bus.busId})
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${schedule.busNo} (${schedule.busId})`
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === schedule.id ? (
                          <select
                            name="routeId"
                            value={form.routeId}
                            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">-- Select Route --</option>
                            {routes.map((route) => (
                              <option key={route.routeId} value={route.routeId}>
                                {route.routeName} ({route.startStop} → {route.endStop})
                              </option>
                            ))}
                          </select>
                        ) : (
                          schedule.routeName
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === schedule.id ? (
                          <Input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                              setForm({ ...form, date: e.target.value })
                            }
                          />
                        ) : (
                          new Date(schedule.date).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === schedule.id ? (
                          <Input
                            type="time"
                            value={form.departureTime}
                            onChange={(e) =>
                              setForm({ ...form, departureTime: e.target.value })
                            }
                          />
                        ) : (
                          schedule.departureTime
                        )}
                      </TableCell>
                      <TableCell>{schedule.routeDistance} km</TableCell>
                      <TableCell>{schedule.routeDuration}</TableCell>
                      <TableCell>
                        {editId === schedule.id ? (
                          <select
                            name="status"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.status === 'Active' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {schedule.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editId === schedule.id ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(schedule.id)}
                            className="bg-blue-600 text-white"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
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