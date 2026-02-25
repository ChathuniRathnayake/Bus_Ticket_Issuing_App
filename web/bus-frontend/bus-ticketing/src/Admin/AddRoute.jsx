import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl">Add New Route</CardTitle>
          </div>
          <CardDescription>Define a new bus route</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Same fields with Label + Input as above */}
            <div className="space-y-2">
              <Label htmlFor="routeId">Route ID</Label>
              <Input id="routeId" name="routeId" value={form.routeId} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name</Label>
              <Input id="routeName" name="routeName" value={form.routeName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startStop">Start Stop</Label>
              <Input id="startStop" name="startStop" value={form.startStop} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endStop">End Stop</Label>
              <Input id="endStop" name="endStop" value={form.endStop} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input id="distance" name="distance" value={form.distance} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hh:mm)</Label>
              <Input id="duration" name="duration" value={form.duration} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-6 bg-violet-600 hover:bg-violet-700">
              {loading ? "Adding..." : "Add Route"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}