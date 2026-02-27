import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Map } from "lucide-react";

export default function AddRoute({ routes, setRoutes }) {

  const [form, setForm] = useState({
    routeId: "",
    routeName: "",
    startStop: "",
    endStop: "",
    distance: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  const handleDurationChange = () => {
    const hours = durationHours.trim() === "" ? "0" : durationHours;
    const minutes = durationMinutes.trim() === "" ? "0" : durationMinutes;
    const formatted = `${hours}:${minutes.padStart(2, "0")}`;
    setForm((prev) => ({ ...prev, duration: formatted }));
  };



  // ✅ BACKEND INTEGRATED SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      routeId,
      routeName,
      startStop,
      endStop,
      distance,
      duration,
      startTime,
      endTime,
    } = form;

    if (
      !routeId ||
      !routeName ||
      !startStop ||
      !endStop ||
      !distance ||
      !duration ||
      !startTime ||
      !endTime
    ) {
      return alert("Please fill all fields");
    }

    const [h, m] = duration.split(":").map(Number);
    if (isNaN(h) || isNaN(m) || m < 0 || m > 59) {
      return alert("Duration minutes must be between 0 and 59");
    }

    setLoading(true);

    try {
      // 🔗 POST → BACKEND
      const res = await axios.post(
        "http://localhost:5000/api/route",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message || "Route added successfully");

      // Refresh routes locally
      setRoutes([...routes, form]);

      // Reset form
      setForm({
        routeId: "",
        routeName: "",
        startStop: "",
        endStop: "",
        distance: "",
        duration: "",
        startTime: "",
        endTime: "",
      });

      setDurationHours("");
      setDurationMinutes("");

      navigate("/admin-dashboard/manage-routes");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add route");
    }

    setLoading(false);
  };



  const availableStops = [
    "Colombo Fort",
    "Kandy",
    "Galle",
    "Negombo",
    "Jaffna",
    "Anuradhapura",
    "Trincomalee",
    "Matara",
    "Nuwara Eliya",
    "Ratnapura",
    "Kurunegala",
    "Batticaloa",
  ];



  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">

        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Map className="h-6 w-6" />
          </div>

          <CardTitle className="text-3xl font-semibold">
            Add New Route
          </CardTitle>

          <CardDescription className="text-muted-foreground mt-2">
            Define a new path for efficient travel
          </CardDescription>
        </CardHeader>



        <CardContent className="px-8 space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-4">

            {/* Route ID */}
            <div className="space-y-2">
              <Label htmlFor="routeId" className="text-sm font-medium">
                Route ID
              </Label>
              <Input
                id="routeId"
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                placeholder="e.g., R001"
                className="h-11 transition-all focus:ring-2 focus:ring-emerald-500"
              />
            </div>


            {/* Route Name */}
            <div className="space-y-2">
              <Label htmlFor="routeName" className="text-sm font-medium">
                Route Name
              </Label>
              <Input
                id="routeName"
                name="routeName"
                value={form.routeName}
                onChange={handleChange}
                placeholder="e.g., City Express"
                className="h-11 transition-all focus:ring-2 focus:ring-emerald-500"
              />
            </div>



            {/* Start Stop */}
            <div className="space-y-2">
              <Label htmlFor="startStop" className="text-sm font-medium">
                Start Stop
              </Label>
              <select
                id="startStop"
                name="startStop"
                value={form.startStop}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
                required
              >
                <option value="">-- Select Start Stop --</option>
                {availableStops.map((stop) => (
                  <option key={stop} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>



            {/* End Stop */}
            <div className="space-y-2">
              <Label htmlFor="endStop" className="text-sm font-medium">
                End Stop
              </Label>
              <select
                id="endStop"
                name="endStop"
                value={form.endStop}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
                required
              >
                <option value="">-- Select End Stop --</option>
                {availableStops
                  .filter((stop) => stop !== form.startStop)
                  .map((stop) => (
                    <option key={stop} value={stop}>
                      {stop}
                    </option>
                  ))}
              </select>
            </div>



            {/* Distance */}
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-medium">
                Distance (km)
              </Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                min="0.1"
                step="0.1"
                value={form.distance}
                onChange={handleChange}
                placeholder="e.g., 50"
                className="h-11 transition-all focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>



            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration</Label>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Hours
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={durationHours}
                    onChange={(e) => {
                      setDurationHours(e.target.value);
                      handleDurationChange();
                    }}
                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Minutes
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => {
                      setDurationMinutes(e.target.value);
                      handleDurationChange();
                    }}
                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>
            </div>



            {/* Times */}
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Start Time
                </Label>
                <Input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  className="h-11 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  End Time
                </Label>
                <Input
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  className="h-11 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>



            {/* Buttons */}
            <div className="flex items-center gap-4 mt-6">

              <Button
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
                className="flex-1 h-11 gap-2 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {loading ? "Adding..." : "Add Route"}
              </Button>

            </div>

          </form>
        </CardContent>

      </Card>
    </div>
  );
}