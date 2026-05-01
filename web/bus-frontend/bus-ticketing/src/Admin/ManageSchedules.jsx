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

export default function ManageSchedules() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

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

  // 🔥 FETCH EVERYTHING (FIXED)
  useEffect(() => {
    const loadData = async () => {
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
          };
        });

        enrichedSchedules.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.departureTime}`);
          const dateB = new Date(`${b.date}T${b.departureTime}`);
          return dateA - dateB;
        });

        setSchedules(enrichedSchedules);
        setFilteredSchedules(enrichedSchedules);

      } catch (error) {
        console.error(error);
        alert("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

      // refresh
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update schedule");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to delete schedule");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="h-10 gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>

        <h2 className="text-3xl font-bold">Manage Schedules</h2>

        <Input
          placeholder="Search schedules..."
          className="w-64"
          onChange={(e) => {
            const q = e.target.value.toLowerCase();
            setFilteredSchedules(
              schedules.filter((s) =>
                s.scheduleId?.toLowerCase().includes(q) ||
                s.busNo?.toLowerCase().includes(q) ||
                s.routeName?.toLowerCase().includes(q)
              )
            );
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedules ({filteredSchedules.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : filteredSchedules.length === 0 ? (
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
                  {filteredSchedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.scheduleId}</TableCell>

                      <TableCell>
                        {editId === s.id ? (
                          <select
                            value={form.busId}
                            onChange={(e) =>
                              setForm({ ...form, busId: e.target.value })
                            }
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

                      <TableCell>{s.routeName}</TableCell>

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

                      <TableCell>{s.status}</TableCell>

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