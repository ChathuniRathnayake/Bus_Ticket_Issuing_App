import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Bus } from "lucide-react";

export default function ManageBuses({ buses, setBuses, routes }) {
  const navigate = useNavigate();

  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    busId: "",
    routeId: "",
    totalSeats: "",
    busNo: "",
    status: "",
  });

  const token = localStorage.getItem("token");



  // ✅ FETCH BUSES FROM BACKEND
  const fetchBuses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/bus",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBuses(res.data);

    } catch (error) {
      console.error(error);
      alert("Failed to fetch buses");
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);




  const handleEdit = (bus, index) => {
    setEditIndex(index);
    setForm({ ...bus });
  };



  // ✅ UPDATE BUS → BACKEND
  const handleSave = async (index) => {
    try {
      const bus = buses[index];

      await axios.put(
        `http://localhost:5000/api/bus/${bus.id}`,
        {
          routeId: form.routeId,
          status: form.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchBuses();
      setEditIndex(null);

    } catch (error) {
      console.error(error);
      alert("Failed to update bus");
    }
  };



  // ✅ DELETE BUS → BACKEND
  const handleDelete = async (index) => {
    if (!confirm("Delete this bus?")) return;

    try {
      const bus = buses[index];

      await axios.delete(
        `http://localhost:5000/api/bus/${bus.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchBuses();

    } catch (error) {
      console.error(error);
      alert("Failed to delete bus");
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Manage Buses</h2>
        </div>
        <Input placeholder="Search buses..." className="w-64 h-10" />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Buses ({buses.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {buses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No buses added yet. Add your first bus from the dashboard.
              </p>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {buses.map((b, i) => (
                    <TableRow
                      key={i}
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >

                      {/* Bus ID */}
                      <TableCell>{b.busId}</TableCell>


                      {/* Route */}
                      <TableCell>
                        {editIndex === i ? (
                          <select
                            value={form.routeId}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                routeId: e.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
                          >
                            <option value="">-- Select Route --</option>
                            {routes.map((route) => (
                              <option
                                key={route.routeId}
                                value={route.routeId}
                              >
                                {route.startStop} → {route.endStop} (
                                {route.routeName || route.routeId})
                              </option>
                            ))}
                          </select>
                        ) : routes.find(
                            (r) => r.routeId === b.routeId
                          ) ? (
                          `${
                            routes.find(
                              (r) => r.routeId === b.routeId
                            ).startStop
                          } → ${
                            routes.find(
                              (r) => r.routeId === b.routeId
                            ).endStop
                          }`
                        ) : (
                          b.routeId || "No Route"
                        )}
                      </TableCell>


                      {/* Seats */}
                      <TableCell>{b.totalSeats}</TableCell>


                      {/* Bus No */}
                      <TableCell>{b.busNo}</TableCell>


                      {/* Status */}
                      <TableCell>
                        {editIndex === i ? (
                          <select
                            value={form.status}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                status: e.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              b.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        )}
                      </TableCell>


                      {/* Actions */}
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editIndex === i ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(i)}
                            className="gap-1 bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 cursor-pointer"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(b, i)}
                            className="gap-1 hover:bg-violet-50 transition-all duration-300 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleDelete(i)}
                          className="gap-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 cursor-pointer"
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