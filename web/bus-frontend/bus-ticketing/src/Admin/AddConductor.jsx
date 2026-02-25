import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users } from "lucide-react";

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
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">
        <CardHeader className="text-center">
          
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-[#318CE7]/20 text-[#318CE7] rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>

          <CardTitle className="text-3xl font-semibold">Add New Conductor</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Onboard a new team member to manage tickets
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">

            <div className="space-y-2">
              <Label htmlFor="conductorId" className="text-sm font-medium">Conductor ID</Label>
              <Input
                id="conductorId"
                name="conductorId"
                value={form.conductorId}
                onChange={handleChange}
                placeholder="e.g., CON-001"
                className="h-11 transition-all focus:ring-2 focus:ring-[#318CE7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className="h-11 transition-all focus:ring-2 focus:ring-[#318CE7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="h-11 transition-all focus:ring-2 focus:ring-[#318CE7]"
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              
              <Button
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
                className="flex-1 h-11 gap-2 hover:bg-[#318CE7]/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 text-white bg-[#318CE7] hover:bg-[#2b7cc9] transition-colors cursor-pointer"
              >
                {loading ? "Adding..." : "Add Conductor"}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}