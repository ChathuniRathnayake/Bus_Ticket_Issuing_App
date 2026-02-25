import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ManageConductors({ conductors, setConductors }) {
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", password: "" });

  const handleEdit = (c) => {
    setEditId(c.id);
    setForm({ name: c.name, password: c.password });
  };
  const handleSave = (id) => {
    setConductors(
      conductors.map((c) =>
        c.id === id ? { ...c, name: form.name, password: form.password } : c
      )
    );
    setEditId(null);
  };
  const handleDelete = (id) => {
    if (confirm("Delete this conductor?")) {
      setConductors(conductors.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Conductors</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conductors ({conductors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conductors.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No conductors added yet. Add your first conductor from the dashboard.
            </p>
          ) : (
            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conductors.map((c) => (
                    <TableRow key={c.id} className="hover:bg-zinc-50">
                      <TableCell>{c.id || c.conductorId}</TableCell>
                      <TableCell>
                        {editId === c.id ? (
                          <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        ) : (
                          c.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === c.id ? (
                          <Input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                          />
                        ) : (
                          "•".repeat(c.password?.length || 8)
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editId === c.id ? (
                          <Button size="sm" onClick={() => handleSave(c.id)}>Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                          Delete
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