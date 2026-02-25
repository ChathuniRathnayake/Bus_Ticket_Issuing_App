import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ManageAdmins({ admins, setAdmins }) {
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleEdit = (admin, index) => { setEditIndex(index); setForm({ ...admin }); };
  const handleSave = (index) => { setAdmins(admins.map((a, i) => i === index ? form : a)); setEditIndex(null); };
  const handleDelete = (index) => { if (confirm("Delete this admin?")) setAdmins(admins.filter((_, i) => i !== index)); };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold">Manage Admins</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No admins yet. Add some from the dashboard.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a, i) => (
                  <TableRow key={i} className="hover:bg-zinc-50">
                    <TableCell>
                      {editIndex === i ? (
                        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      ) : a.email}
                    </TableCell>
                    <TableCell>
                      {editIndex === i ? (
                        <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                      ) : "••••••••"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {editIndex === i ? (
                        <Button size="sm" onClick={() => handleSave(i)}>Save</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(a, i)}>Edit</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}