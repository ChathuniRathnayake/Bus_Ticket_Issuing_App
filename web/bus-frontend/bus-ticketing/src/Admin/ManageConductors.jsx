import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

export default function ManageConductors() {
  const navigate = useNavigate();
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", password: "" });

  const token = localStorage.getItem("token");



  // 🔹 FETCH CONDUCTORS
  const fetchConductors = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/conductor",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setConductors(res.data);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to fetch conductors");
    } finally {
      setLoading(false);
    }
  };



  // 🔹 INITIAL LOAD
  useEffect(() => {
    if (!token) {
      alert("You must login first");
      navigate("/admin-login");
      return;
    }

    fetchConductors();
  }, [token, navigate]);



  // 🔹 EDIT
  const handleEdit = (c) => {
    setEditId(c.id);
    setForm({ name: c.name, password: "" });
  };



  // 🔹 UPDATE
  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/conductor/${id}`,
        {
          name: form.name,
          password: form.password || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchConductors();
      setEditId(null);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update conductor");
    }
  };



  // 🔹 DELETE
  const handleDelete = async (id) => {
    if (!confirm("Delete this conductor?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/conductor/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchConductors();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete conductor");
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
            Manage Conductors
          </h2>
        </div>

        <Input
          placeholder="Search conductors..."
          className="w-64 h-10"
        />
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle>
            Conductors ({conductors.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-muted-foreground">
              Loading...
            </p>
          ) : conductors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No conductors found.
              </p>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {conductors.map((c) => (
                    <TableRow
                      key={c.id}
                      className="even:bg-muted/50 hover:bg-muted transition-all duration-300"
                    >
                      <TableCell>
                        {c.id || c.conductorId}
                      </TableCell>

                      <TableCell>
                        {editId === c.id ? (
                          <Input
                            value={form.name}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                name: e.target.value
                              })
                            }
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
                            placeholder="••••••••"
                            onChange={(e) =>
                              setForm({
                                ...form,
                                password: e.target.value
                              })
                            }
                            className="h-10 w-full focus:ring-blue-500"
                          />
                        ) : (
                          "•".repeat(c.password?.length || 8)
                        )}
                      </TableCell>

                      <TableCell className="text-right flex gap-2 justify-end">
                        {editId === c.id ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(c.id)}
                            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 cursor-pointer"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(c)}
                            className="gap-1 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleDelete(c.id)}
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