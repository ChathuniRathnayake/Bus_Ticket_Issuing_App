import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Map } from "lucide-react";

export default function ManageRoutes({ routes, setRoutes }) {
  const navigate = useNavigate();
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

  const handleEdit = (route, index) => {
    setEditIndex(index);
    setForm({ ...route }); // Load full route data, but we'll only allow editing time
  };

  const handleSave = (index) => {
    // Only update startTime and endTime – keep other fields unchanged
    setRoutes(
      routes.map((r, i) =>
        i === index
          ? {
              ...r,
              startTime: form.startTime,
              endTime: form.endTime,
            }
          : r
      )
    );
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    if (confirm("Delete this route?")) {
      setRoutes(routes.filter((_, i) => i !== index));
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
          <h2 className="text-3xl font-bold tracking-tight">Manage Routes</h2>
        </div>
        <Input placeholder="Search routes..." className="w-64 h-10" />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Routes ({routes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-12">
              <Map className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No routes added yet. Add your first route from the dashboard.</p>
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
                    <TableRow key={i} className="even:bg-muted/50 hover:bg-muted transition-all duration-300">
                      {/* Route ID – read-only always */}
                      <TableCell>{r.routeId}</TableCell>

                      {/* Name – read-only */}
                      <TableCell>{r.routeName}</TableCell>

                      {/* Start Stop – read-only */}
                      <TableCell>{r.startStop}</TableCell>

                      {/* End Stop – read-only */}
                      <TableCell>{r.endStop}</TableCell>

                      {/* Distance – read-only */}
                      <TableCell>{r.distance}</TableCell>

                      {/* Duration – read-only */}
                      <TableCell>{r.duration}</TableCell>

                      {/* Start Time – editable in edit mode */}
                      <TableCell>
                        {editIndex === i ? (
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                            className="h-10 w-full focus:ring-emerald-500"
                          />
                        ) : (
                          r.startTime || "-"
                        )}
                      </TableCell>

                      {/* End Time – editable in edit mode */}
                      <TableCell>
                        {editIndex === i ? (
                          <Input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
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