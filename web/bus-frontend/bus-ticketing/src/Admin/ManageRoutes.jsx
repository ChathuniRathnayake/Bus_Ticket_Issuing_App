import { useState, useEffect } from "react";
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
import { ArrowLeft, Pencil, Trash2, Map } from "lucide-react";

export default function ManageRoutes() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
  });

  /* =====================================================
     FETCH ROUTES
  ===================================================== */
  const fetchRoutes = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/route",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRoutes(res.data);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */
  useEffect(() => {
    if (!token) {
      alert("Login required");
      navigate("/admin-login");
      return;
    }

    fetchRoutes();
  }, [token, navigate]);

  /* =====================================================
     EDIT
  ===================================================== */
  const handleEdit = (route) => {
    setEditId(route.id);
    setForm({
      startTime: route.startTime || "",
      endTime: route.endTime || "",
    });
  };

  /* =====================================================
     UPDATE ROUTE
  ===================================================== */
  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/route/${id}`,
        {
          startTime: form.startTime,
          endTime: form.endTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Route updated successfully");
      setEditId(null);
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
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">

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

          <h2 className="text-3xl font-bold tracking-tight">
            Manage Routes
          </h2>
        </div>

        <Input
          placeholder="Search routes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 h-10"
        />

      </div>

      <Card className="shadow-lg rounded-2xl border-border">

        <CardHeader>
          <CardTitle>
            Routes ({filteredRoutes.length})
          </CardTitle>
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
                  <TableRow className="bg-muted/50">
                    <TableHead>Route ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Stop</TableHead>
                    <TableHead>End Stop</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {filteredRoutes.map((r) => (

                    <TableRow
                      key={r.id}
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >

                      <TableCell>{r.routeId}</TableCell>
                      <TableCell>{r.routeName}</TableCell>
                      <TableCell>{r.startStop}</TableCell>
                      <TableCell>{r.endStop}</TableCell>
                      <TableCell>{r.distance}</TableCell>
                      <TableCell>{r.duration}</TableCell>

                      {/* Start Time */}
                      <TableCell>
                        {editId === r.id ? (
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) =>
                              setForm({ ...form, startTime: e.target.value })
                            }
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
                            onChange={(e) =>
                              setForm({ ...form, endTime: e.target.value })
                            }
                          />
                        ) : (
                          r.endTime || "-"
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right flex gap-2 justify-end">

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