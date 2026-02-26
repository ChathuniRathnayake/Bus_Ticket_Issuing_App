import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, ShieldCheck } from "lucide-react";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // Firebase ID token

  // Fetch all admins
  const fetchAdmins = async () => {
    if (!token) {
      alert("You must login first");
      navigate("/admin-login");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Edit admin locally
  const handleEdit = (admin, index) => {
    setEditIndex(index);
    setForm({ ...admin });
  };

  // Save updated admin to backend
  const handleSave = async (index) => {
    const admin = admins[index];
    try {
      await axios.put(
        `http://localhost:5000/api/admin/${id}`, 
        { email: form.email, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } } // Auth header
      );
      alert("Admin updated successfully");
      fetchAdmins(); // refresh data
      setEditIndex(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update admin");
    }
  };

  // Delete admin
  const handleDelete = async (index) => {
    const admin = admins[index];
    if (!confirm("Delete this admin?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${admin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Admin deleted successfully");
      fetchAdmins(); // refresh data
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete admin");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="h-10 gap-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Manage Admins</h2>
        </div>
        <Input placeholder="Search admins..." className="w-64 h-10" />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Admin Accounts ({admins.length})</CardTitle>
          <CardDescription className="text-muted-foreground">
            View and edit admin details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
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
                    <TableRow key={a.id} className="even:bg-muted/50 hover:bg-muted transition-colors">
                      <TableCell>
                        {editIndex === i ? (
                          <Input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="h-10 w-full"
                          />
                        ) : (
                          a.email
                        )}
                      </TableCell>
                      <TableCell>
                        {editIndex === i ? (
                          <Input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="h-10 w-full"
                          />
                        ) : (
                          "••••••••"
                        )}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {editIndex === i ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(i)}
                            className="gap-1 bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300 cursor-pointer"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(a, i)}
                            className="gap-1 hover:bg-amber-50 transition-all duration-300 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
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