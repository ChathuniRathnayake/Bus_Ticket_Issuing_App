import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ManageRoutes({ routes, setRoutes }) {
  const navigate = useNavigate();
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    routeId: "", routeName: "", startStop: "", endStop: "", distance: "", duration: "",
  });

  const handleEdit = (route, index) => { setEditIndex(index); setForm({ ...route }); };
  const handleSave = (index) => { setRoutes(routes.map((r, i) => i === index ? form : r)); setEditIndex(null); };
  const handleDelete = (index) => { if (confirm("Delete this route?")) setRoutes(routes.filter((_, i) => i !== index)); };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Routes</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routes ({routes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No routes added yet. Add your first route from the dashboard.
            </p>
          ) : (
            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Stop</TableHead>
                    <TableHead>End Stop</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((r, i) => (
                    <TableRow key={i} className="hover:bg-zinc-50">
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} />
                        ) : r.routeId}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.routeName} onChange={e => setForm({ ...form, routeName: e.target.value })} />
                        ) : r.routeName}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.startStop} onChange={e => setForm({ ...form, startStop: e.target.value })} />
                        ) : r.startStop}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.endStop} onChange={e => setForm({ ...form, endStop: e.target.value })} />
                        ) : r.endStop}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
                        ) : r.distance}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                        ) : r.duration}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editIndex === i ? (
                          <Button size="sm" onClick={() => handleSave(i)}>Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(r, i)}>Edit</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>Delete</Button>
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