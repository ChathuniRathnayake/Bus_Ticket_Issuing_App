import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl">Add New Bus</CardTitle>
          </div>
          <CardDescription>Add a bus to the fleet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="busId">Bus ID</Label>
              <Input id="busId" name="busId" value={form.busId} onChange={handleChange} placeholder="BUS-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeId">Route ID</Label>
              <Input id="routeId" name="routeId" value={form.routeId} onChange={handleChange} placeholder="R001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input id="totalSeats" name="totalSeats" type="number" value={form.totalSeats} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="busNo">Bus Number</Label>
              <Input id="busNo" name="busNo" value={form.busNo} onChange={handleChange} placeholder="NB-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-6 bg-violet-600 hover:bg-violet-700">
              {loading ? "Adding..." : "Add Bus"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}