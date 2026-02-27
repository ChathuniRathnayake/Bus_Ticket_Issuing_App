import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Map } from "lucide-react";

export default function ManageRoutes({ routes, setRoutes }) {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    routeId: "",
    routeName: "",
    startStop: "",
    endStop: "",
    distance: "",
    duration: "",
    startTime: "",
    endTime: "",
  });



  // ✅ FETCH ROUTES FROM BACKEND
  const fetchRoutes = async () => {
    try {
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
    }
  };



  useEffect(() => {
    if (!token) {
      alert("Login required");
      navigate("/admin-login");
      return;
    }

    fetchRoutes();
  }, []);



  const handleEdit = (route, index) => {
    setEditIndex(index);
    setForm({ ...route });
  };



  // ✅ UPDATE ROUTE TIME → BACKEND
  const handleSave = async (index) => {

    const route = routes[index];

    try {
      await axios.put(
        `http://localhost:5000/api/route/${route.id || route.routeId}`,
        {
          startTime: form.startTime,
          endTime: form.endTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Route updated successfully");

      fetchRoutes();
      setEditIndex(null);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update route");
    }
  };



  // ✅ DELETE ROUTE → BACKEND
  const handleDelete = async (index) => {

    const route = routes[index];

    if (!confirm("Delete this route?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/route/${route.id || route.routeId}`,
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

          <h2 className="text-3xl font-bold tracking-tight">
            Manage Routes
          </h2>
        </div>

        <Input
          placeholder="Search routes..."
          className="w-64 h-10"
        />

      </div>



      <Card className="shadow-lg rounded-2xl border-border">

        <CardHeader>
          <CardTitle>
            Routes ({routes.length})
          </CardTitle>
        </CardHeader>



        <CardContent>

          {routes.length === 0 ? (

            <div className="text-center py-12">
              <Map className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No routes added yet. Add your first route from the dashboard.
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

                  {routes.map((r, i) => (

                    <TableRow
                      key={i}
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
                        {editIndex === i ? (
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) =>
                              setForm({ ...form, startTime: e.target.value })
                            }
                            className="h-10 w-full focus:ring-emerald-500"
                          />
                        ) : (
                          r.startTime || "-"
                        )}
                      </TableCell>



                      {/* End Time */}
                      <TableCell>
                        {editIndex === i ? (
                          <Input
                            type="time"
                            value={form.endTime}
                            onChange={(e) =>
                              setForm({ ...form, endTime: e.target.value })
                            }
                            className="h-10 w-full focus:ring-emerald-500"
                          />
                        ) : (
                          r.endTime || "-"
                        )}
                      </TableCell>



                      {/* Actions */}
                      <TableCell className="text-right flex gap-2 justify-end">

                        {editIndex === i ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(i)}
                            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 cursor-pointer"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(r, i)}
                            className="gap-1 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
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