import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Map } from "lucide-react";

export default function AddRoute({ routes, setRoutes }) {
  const [form, setForm] = useState({
    routeId: "", routeName: "", startStop: "", endStop: "", distance: "", duration: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const { routeId, routeName, startStop, endStop, distance, duration } = form;
    if (!routeId || !routeName || !startStop || !endStop || !distance || !duration) {
      return alert("Please fill all fields");
    }
    setLoading(true);
    setTimeout(() => {
      setRoutes([...routes, form]);
      alert(`Route Added!\nRoute ID: ${routeId}\nName: ${routeName}`);
      setForm({ routeId: "", routeName: "", startStop: "", endStop: "", distance: "", duration: "" });
      setLoading(false);
      navigate("/admin-dashboard/manage-routes");
    }, 500);
  };
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Map className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-semibold">Add New Route</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">Define a new path for efficient travel</CardDescription>
        </CardHeader>
        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="routeId" className="text-sm font-medium">Route ID</Label>
              <Input id="routeId" name="routeId" value={form.routeId} onChange={handleChange} placeholder="e.g., R001" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeName" className="text-sm font-medium">Route Name</Label>
              <Input id="routeName" name="routeName" value={form.routeName} onChange={handleChange} placeholder="e.g., City Express" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startStop" className="text-sm font-medium">Start Stop</Label>
              <Input id="startStop" name="startStop" value={form.startStop} onChange={handleChange} placeholder="e.g., Downtown Station" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endStop" className="text-sm font-medium">End Stop</Label>
              <Input id="endStop" name="endStop" value={form.endStop} onChange={handleChange} placeholder="e.g., Airport Terminal" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-medium">Distance (km)</Label>
              <Input id="distance" name="distance" value={form.distance} onChange={handleChange} placeholder="e.g., 50" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">Duration (hh:mm)</Label>
              <Input id="duration" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g., 01:30" className="h-11 transition-all focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button variant="outline" onClick={() => navigate("/admin-dashboard")} className="flex-1 h-11 gap-2 hover:bg-emerald-50 transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer">
                {loading ? "Adding..." : "Add Route"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}