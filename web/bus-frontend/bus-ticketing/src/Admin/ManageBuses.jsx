import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ManageBuses({ buses, setBuses }) {
  const navigate = useNavigate();
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ busId: "", routeId: "", totalSeats: "", busNo: "", status: "" });

  const handleEdit = (bus, index) => { setEditIndex(index); setForm({ ...bus }); };
  const handleSave = (index) => { setBuses(buses.map((b, i) => i === index ? form : b)); setEditIndex(null); };
  const handleDelete = (index) => { if (confirm("Delete this bus?")) setBuses(buses.filter((_, i) => i !== index)); };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Buses</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buses ({buses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {buses.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No buses added yet. Add your first bus from the dashboard.
            </p>
          ) : (
            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Bus Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.map((b, i) => (
                    <TableRow key={i} className="hover:bg-zinc-50">
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.busId} onChange={e => setForm({ ...form, busId: e.target.value })} />
                        ) : b.busId}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} />
                        ) : b.routeId}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input type="number" value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} />
                        ) : b.totalSeats}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.busNo} onChange={e => setForm({ ...form, busNo: e.target.value })} />
                        ) : b.busNo}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"}`}>
                            {b.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editIndex === i ? (
                          <Button size="sm" onClick={() => handleSave(i)}>Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(b, i)}>Edit</Button>
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