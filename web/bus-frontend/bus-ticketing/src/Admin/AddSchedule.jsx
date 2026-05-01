import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar } from "lucide-react";

export default function AddSchedule() {
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    scheduleId: "",
    busId: "",
    routeId: "",
    date: "",
    departureTime: "",
    status: "Active",
  });

  // 🔥 Fetch buses & routes
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [busRes, routeRes] = await Promise.all([
          fetch("http://localhost:5000/api/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/route", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const busesData = await busRes.json();
        const routesData = await routeRes.json();

        setBuses(busesData);
        setRoutes(routesData);

      } catch (err) {
        console.error(err);
        alert("Failed to load buses or routes");
      }
    };

    fetchData();
  }, [navigate]);

  // 🔧 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto set route when bus selected
    if (name === "busId") {
      const selectedBus = buses.find((b) => b.id === value);

      setForm((prev) => ({
        ...prev,
        busId: value,
        routeId: selectedBus?.routeId || "",
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { scheduleId, busId, routeId, date, departureTime, status } = form;

    if (!scheduleId || !busId || !routeId || !date || !departureTime) {
      return alert("Please fill all required fields");
    }

    // Prevent duplicate schedule
    const exists = false; // (optional backend validation preferred)

    if (exists) {
      return alert("Schedule already exists for this bus");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        scheduleId,
        busId,
        routeId,
        date,
        departureTime,
        status,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(`Schedule Added Successfully!`);

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
      alert(error.message || "Failed to add schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-dashboard")}
          className="h-11 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Add Schedule</h1>
            <p className="text-muted-foreground">
              Create a new bus schedule
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>
            Fill in the details to create a new schedule
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Schedule ID */}
              <div>
                <Label>Schedule ID *</Label>
                <Input
                  name="scheduleId"
                  value={form.scheduleId}
                  onChange={handleChange}
                  placeholder="SCH001"
                />
              </div>

              {/* Bus */}
              <div>
                <Label>Bus *</Label>
                <select
                  name="busId"
                  value={form.busId}
                  onChange={handleChange}
                  className="w-full h-10 border rounded-md px-3"
                >
                  <option value="">-- Select Bus --</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.busNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Route */}
              <div>
                <Label>Route *</Label>
                <select
                  name="routeId"
                  value={form.routeId}
                  onChange={handleChange}
                  className="w-full h-10 border rounded-md px-3"
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.routeId}>
                      {route.routeName} ({route.startStop} → {route.endStop})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              {/* Time */}
              <div>
                <Label>Departure Time *</Label>
                <Input
                  type="time"
                  name="departureTime"
                  value={form.departureTime}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div>
                <Label>Status *</Label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 border rounded-md px-3"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white"
              >
                {loading ? "Adding..." : "Add Schedule"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin-dashboard/manage-schedules")}
                className="flex-1"
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