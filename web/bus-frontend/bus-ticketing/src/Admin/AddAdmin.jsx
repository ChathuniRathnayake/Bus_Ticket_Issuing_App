import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AddAdmin({ admins, setAdmins }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return alert("Fill all fields");

    setAdmins([...admins, form]);
    setForm({ email: "", password: "" });
    navigate("/admin-dashboard/manage-admins");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">

        <CardHeader className="text-center">
          
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-[#A0785A]/20 text-[#A0785A] rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <CardTitle className="text-3xl font-semibold">Add New Admin</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Grant secure administrator access to the system
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email (e.g., admin@bus.com)"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="h-11 transition-all focus:ring-2 focus:ring-[#A0785A]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="h-11 transition-all focus:ring-2 focus:ring-[#A0785A]"
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              
              <Button
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
                className="flex-1 h-11 gap-2 hover:bg-[#A0785A]/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 " /> Back
              </Button>

              <Button
                type="submit"
                className="flex-1 h-11 text-white bg-[#A0785A] hover:bg-[#8b654b] transition-colors cursor-pointer"
              >
                Add Admin
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}