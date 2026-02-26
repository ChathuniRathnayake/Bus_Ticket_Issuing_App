import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure you installed axios
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
import { ArrowLeft, Users } from "lucide-react";

export default function AddConductor() {
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.name || !form.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Get Firebase ID token from localStorage (after admin login)
      // Get token using the correct key
      const token = localStorage.getItem("token"); // matches AdminLogin.jsx
      if (!token) {
        alert("You must login first");
        setLoading(false);
        return;
      }

      // ✅ Correct backend URL
      const res = await axios.post(
        "http://localhost:5000/api/conductor", // singular 'conductor'
        { email: form.email, name: form.name, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }, // auth middleware
      );

      alert(res.data.message);
      setForm({ email: "", name: "", password: "" });
      navigate("/admin-dashboard/manage-conductors");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#318CE7]/20 text-[#318CE7] rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-semibold">
            Add New Conductor
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Onboard a new team member to manage tickets
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g., conductor@mail.com"
                className="h-11 transition-all focus:ring-2 focus:ring-[#318CE7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
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
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
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
