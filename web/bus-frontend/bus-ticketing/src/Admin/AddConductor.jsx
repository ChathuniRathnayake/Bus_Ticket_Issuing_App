import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddConductor({ conductors, setConductors }) {
  const [form, setForm] = useState({ conductorId: "", name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.conductorId || !form.name || !form.password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setConductors([...conductors, form]);
      setForm({ conductorId: "", name: "", password: "" });
      setLoading(false);
      navigate("/admin-dashboard/manage-conductors");
    }, 500);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl">Add Conductor</CardTitle>
          </div>
          <CardDescription>Add a new conductor to the team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="conductorId">Conductor ID</Label>
              <Input id="conductorId" name="conductorId" value={form.conductorId} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-6 bg-zinc-900 hover:bg-black">
              {loading ? "Adding..." : "Add Conductor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}