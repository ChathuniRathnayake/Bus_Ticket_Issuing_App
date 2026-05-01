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
import { ArrowLeft, Pencil, Trash2, Bus } from "lucide-react";

export default function ManageBuses() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    busNo: "",
    routeId: "",
    totalSeats: "",
    status: "",
  });

  const token = localStorage.getItem("token");

  // FETCH ALL BUSES
  const fetchBuses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/bus", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(res.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch buses");
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

    fetchBuses();
  }, [navigate]);

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
        `http://localhost:5000/api/bus/${id}`,
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
      await axios.delete(`http://localhost:5000/api/bus/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBuses();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete bus");
    }
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Buses</h2>
        <Input
          placeholder="Search buses..."
          className="w-64 h-10"
          onChange={(e) => {
            const query = e.target.value.toLowerCase();
            setBuses((prev) =>
              prev.filter((b) =>
                b.busNo.toLowerCase().includes(query) ||
                b.routeId.toLowerCase().includes(query) ||
                b.id.toLowerCase().includes(query)
              )
            );
          }}
        />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Buses ({buses.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12">Loading...</p>
          ) : buses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No buses found.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Bus Number</TableHead>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Total Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {buses.map((bus) => (
                    <TableRow
                      key={bus.id}
                      className="even:bg-muted/50 hover:bg-muted"
                    >
                      <TableCell>{bus.id}</TableCell>
                      <TableCell>
                        {editId === bus.id ? (
                          <Input
                            value={form.busNo}
                            onChange={(e) =>
                              setForm({ ...form, busNo: e.target.value })
                            }
                          />
                        ) : (
                          bus.busNo
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === bus.id ? (
                          <Input
                            value={form.routeId}
                            onChange={(e) =>
                              setForm({ ...form, routeId: e.target.value })
                            }
                          />
                        ) : (
                          bus.routeId
                        )}
                      </TableCell>
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
                          bus.totalSeats
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
                          bus.status
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