import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bus } from "lucide-react";

export default function AddBus({ buses, setBuses }) {
  const [form, setForm] = useState({
    busId: "", routeId: "", totalSeats: "", busNo: "", status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { busId, routeId, totalSeats, busNo, status } = form;
    if (!busId || !routeId || !totalSeats || !busNo || !status) return alert("Please fill all fields");

    setLoading(true);
    setTimeout(() => {
      setBuses([...buses, form]);
      alert(`Bus Added!\nBus ID: ${busId}\nBus No: ${busNo}`);
      setForm({ busId: "", routeId: "", totalSeats: "", busNo: "", status: "Active" });
      setLoading(false);
      navigate("/admin-dashboard/manage-buses");
    }, 500);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">
        
        <CardHeader className="text-center">
          
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-[#9966CC]/20 text-[#9966CC] rounded-full flex items-center justify-center mb-4">
            <Bus className="h-6 w-6" />
          </div>

          <CardTitle className="text-3xl font-semibold">Add New Bus</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Expand your fleet with a new bus entry
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">

            <div className="space-y-2">
              <Label htmlFor="busId" className="text-sm font-medium">Bus ID</Label>
              <Input
                id="busId"
                name="busId"
                value={form.busId}
                onChange={handleChange}
                placeholder="e.g., BUS-001"
                className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeId" className="text-sm font-medium">Route ID</Label>
              <Input
                id="routeId"
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                placeholder="e.g., R001"
                className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSeats" className="text-sm font-medium">Total Seats</Label>
              <Input
                id="totalSeats"
                name="totalSeats"
                type="number"
                value={form.totalSeats}
                onChange={handleChange}
                placeholder="e.g., 50"
                className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="busNo" className="text-sm font-medium">Bus Number</Label>
              <Input
                id="busNo"
                name="busNo"
                value={form.busNo}
                onChange={handleChange}
                placeholder="e.g., NB-1234"
                className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-4 mt-6">
              
              <Button
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
                className="flex-1 h-11 gap-2 hover:bg-[#9966CC]/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 r" /> Back
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 text-white bg-[#9966CC] hover:bg-[#875bb5] transition-colors cursor-pointer"
              >
                {loading ? "Adding..." : "Add Bus"}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}