import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar } from "lucide-react";

export default function AddSchedule({ buses, routes, schedules, setSchedules }) {
  const [form, setForm] = useState({
    scheduleId: "",
    busId: "",
    routeId: "",
    date: "",
    departureTime: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { scheduleId, busId, routeId, date, departureTime, status } = form;

    if (!scheduleId || !busId || !routeId || !date || !departureTime || !status) {
      return alert("Please fill all required fields");
    }

    // Check if schedule ID already exists
    if (schedules.some(s => s.scheduleId === scheduleId)) {
      return alert("Schedule ID already exists");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add schedule");

      // Update local state
      setSchedules(prev => [...prev, form]);

      alert(`Schedule Added Successfully! Schedule ID: ${scheduleId}`);

      // Reset form
      setForm({
        scheduleId: "",
        busId: "",
        routeId: "",
        date: "",
        departureTime: "",
        status: "Active",
      });

      navigate("/admin-dashboard/manage-schedules");
    } catch (error) {
      console.error(error);
      alert("Failed to add schedule: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-dashboard")}
          className="h-11 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Schedule</h1>
            <p className="text-muted-foreground">Create a new bus schedule</p>
          </div>
        </div>
      </div>

      <Card className="border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Schedule Details</CardTitle>
          <CardDescription>
            Fill in the details to create a new bus schedule
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduleId">Schedule ID *</Label>
                <Input
                  id="scheduleId"
                  name="scheduleId"
                  value={form.scheduleId}
                  onChange={handleChange}
                  placeholder="e.g., SCH001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="busId">Bus *</Label>
                <select
                  id="busId"
                  name="busId"
                  value={form.busId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select Bus --</option>
                  {buses.map((bus) => (
                    <option key={bus.busId} value={bus.busId}>
                      {bus.busNo} (ID: {bus.busId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="routeId">Route *</Label>
                <select
                  id="routeId"
                  name="routeId"
                  value={form.routeId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((route) => (
                    <option key={route.routeId} value={route.routeId}>
                      {route.routeName} ({route.startStop} → {route.endStop})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time *</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  value={form.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
              >
                {loading ? "Adding..." : "Add Schedule"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin-dashboard/manage-schedules")}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}