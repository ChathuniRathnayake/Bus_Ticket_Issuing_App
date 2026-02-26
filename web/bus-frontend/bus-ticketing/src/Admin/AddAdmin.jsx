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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // Firebase ID token

  // Fetch admins from backend
  const fetchAdmins = async () => {
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
    if (!token) {
      alert("You must login first");
      navigate("/admin-login");
      return;
    }
    fetchAdmins();
  }, []);

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return alert("Fill all fields");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin",
        { email: form.email, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setForm({ email: "", password: "" });
      fetchAdmins(); // refresh list
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add admin");
    }
  };

  // Delete admin
  const handleDelete = async (id) => {
    if (!confirm("Delete this admin?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins(); // refresh list
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete admin");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background/50 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="h-10 gap-2 hover:bg-muted transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Admins</h2>
      </div>

      {/* Add Admin Form */}
      <Card className="shadow-lg rounded-2xl border-border mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#A0785A]/20 text-[#A0785A] rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold">Add New Admin</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Grant secure administrator access
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <form className="grid gap-4" onSubmit={handleAddAdmin}>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="admin@bus.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 focus:ring-2 focus:ring-[#A0785A]"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="h-11 focus:ring-2 focus:ring-[#A0785A]"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-white bg-[#A0785A] hover:bg-[#8b654b] transition-colors"
            >
              Add Admin
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Admins ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No admins found
            </p>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <table className="min-w-full table-auto">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >
                      <td className="px-4 py-2">{admin.id || admin.adminId}</td>
                      <td className="px-4 py-2">{admin.email}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                          className="gap-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}