import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

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
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")} className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Manage Conductors</h2>
        </div>
        <Input placeholder="Search conductors..." className="w-64 h-10" /> {/* Placeholder search for UI */}
      </div>
      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Conductors ({conductors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conductors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conductors added yet. Add your first conductor from the dashboard.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conductors.map((c) => (
                    <TableRow key={c.id} className="even:bg-muted/50 hover:bg-muted transition-all duration-300">
                      <TableCell>{c.id || c.conductorId}</TableCell>
                      <TableCell>
                        {editId === c.id ? (
                          <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="h-10 w-full focus:ring-blue-500"
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
                            className="h-10 w-full focus:ring-blue-500"
                          />
                        ) : (
                          "•".repeat(c.password?.length || 8)
                        )}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editId === c.id ? (
                          <Button size="sm" onClick={() => handleSave(c.id)} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 cursor-pointer">Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(c)} className="gap-1 hover:bg-blue-50 transition-all duration-300 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</Button>
                        )}
                        <Button size="sm" onClick={() => handleDelete(c.id)} className="gap-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 cursor-pointer"><Trash2 className="h-4 w-4" /> Delete</Button>
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