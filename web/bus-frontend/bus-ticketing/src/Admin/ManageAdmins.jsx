import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function ManageAdmins({ admins, setAdmins }) {
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const handleEdit = (admin, index) => { setEditIndex(index); setForm({ ...admin }); };
  const handleSave = (index) => { setAdmins(admins.map((a, i) => i === index ? form : a)); setEditIndex(null); };
  const handleDelete = (index) => { if (confirm("Delete this admin?")) setAdmins(admins.filter((_, i) => i !== index)); };
  return (
    <div className="max-w-5xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")} className="h-10 gap-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Manage Admins</h2>
        </div>
        <Input placeholder="Search admins..." className="w-64 h-10" /> {/* Placeholder search for UI */}
      </div>
      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Admin Accounts ({admins.length})</CardTitle>
          <CardDescription className="text-muted-foreground">View and edit admin details</CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No admins yet. Add some from the dashboard.</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((a, i) => (
                    <TableRow key={i} className="even:bg-muted/50 hover:bg-muted transition-colors">
                      <TableCell>
                        {editIndex === i ? (
                          <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-10 w-full" />
                        ) : a.email}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-10 w-full" />
                        ) : "••••••••"}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editIndex === i ? (
                          <Button size="sm" onClick={() => handleSave(i)} className="gap-1 bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300 cursor-pointer">Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(a, i)} className="gap-1 hover:bg-amber-50 transition-all duration-300 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(i)} className="gap-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 cursor-pointer"><Trash2 className="h-4 w-4" /> Delete</Button>
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