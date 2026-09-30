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
    fare: "",
  });

  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [intermediateStopsText, setIntermediateStopsText] = useState("");
  const [customStopFields, setCustomStopFields] = useState({ startStop: false, endStop: false });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStopSelection = (event) => {
    const { name, value } = event.target;
    if (value === "__add_new_stop__") {
      setCustomStopFields((prev) => ({ ...prev, [name]: true }));
      setForm((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const useExistingStops = (fieldName) => {
    setCustomStopFields((prev) => ({ ...prev, [fieldName]: false }));
    setForm((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Build the "H:MM" duration string from the explicit hour/minute inputs.
  // Values are passed in directly to avoid reading stale state right after
  // setDurationHours/setDurationMinutes.
  const updateDuration = (hoursValue, minutesValue) => {
    const hours = String(hoursValue ?? "").trim() === "" ? "0" : String(hoursValue).trim();
    const minutes = String(minutesValue ?? "").trim() === "" ? "0" : String(minutesValue).trim();
    setForm((prev) => ({ ...prev, duration: `${hours}:${minutes.padStart(2, "0")}` }));
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
    } = form;

    if (
      !routeId ||
      !routeName ||
      !startStop ||
      !endStop ||
      !distance ||
      !duration
    ) {
      return alert("Please fill all fields");
    }

    const [h, m] = duration.split(":").map(Number);
    if (isNaN(h) || isNaN(m) || m < 0 || m > 59) {
      return alert("Duration minutes must be between 0 and 59");
    }

    const fareTrimmed = String(form.fare ?? "").trim();
    let priceCents;
    if (fareTrimmed !== "") {
      const rupees = Number(fareTrimmed);
      if (!Number.isFinite(rupees) || rupees < 0) {
        return alert("Fare must be a non-negative amount in rupees");
      }
      priceCents = Math.round(rupees * 100);
    }

    setLoading(true);

    try {
      const stops = [
        { name: startStop, stopType: "terminal", boardingAllowed: true, alightingAllowed: false },
        ...intermediateStopsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
          const [name, stopType = "normal_road_waypoint", boarding = "false", alighting = "false"] = line.split("|").map((part) => part.trim());
          return {
            name,
            stopType,
            boardingAllowed: boarding.toLowerCase() === "true" && stopType !== "expressway_interchange" && stopType !== "expressway_segment",
            alightingAllowed: alighting.toLowerCase() === "true" && stopType !== "expressway_interchange" && stopType !== "expressway_segment",
          };
        }),
        { name: endStop, stopType: "terminal", boardingAllowed: false, alightingAllowed: true },
      ];

      const payload = { routeId, routeName, startStop, endStop, distance, duration, stops };
      if (priceCents !== undefined) payload.priceCents = priceCents;

      const res = await axios.post(
        "/api/route",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message || "Route added successfully");

      // Refresh routes locally
      setRoutes([...routes, payload]);

      // Reset form
      setForm({
        routeId: "",
        routeName: "",
        startStop: "",
        endStop: "",
        distance: "",
        duration: "",
        fare: "",
      });

      setDurationHours("");
      setDurationMinutes("");
      setIntermediateStopsText("");
      setCustomStopFields({ startStop: false, endStop: false });

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
              {customStopFields.startStop ? (
                <div className="flex gap-2">
                  <Input
                    id="startStop"
                    name="startStop"
                    value={form.startStop}
                    onChange={handleChange}
                    placeholder="Enter a new start stop"
                    className="h-11"
                    required
                  />
                  <Button type="button" variant="outline" onClick={() => useExistingStops("startStop")}>
                    Choose existing
                  </Button>
                </div>
              ) : (
                <select
                  id="startStop"
                  name="startStop"
                  value={form.startStop}
                  onChange={handleStopSelection}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">-- Select Start Stop --</option>
                  {availableStops.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                  <option value="__add_new_stop__">+ Add a new stop...</option>
                </select>
              )}
            </div>



            {/* End Stop */}
            <div className="space-y-2">
              <Label htmlFor="endStop" className="text-sm font-medium">
                End Stop
              </Label>
              {customStopFields.endStop ? (
                <div className="flex gap-2">
                  <Input
                    id="endStop"
                    name="endStop"
                    value={form.endStop}
                    onChange={handleChange}
                    placeholder="Enter a new end stop"
                    className="h-11"
                    required
                  />
                  <Button type="button" variant="outline" onClick={() => useExistingStops("endStop")}>
                    Choose existing
                  </Button>
                </div>
              ) : (
                <select
                  id="endStop"
                  name="endStop"
                  value={form.endStop}
                  onChange={handleStopSelection}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">-- Select End Stop --</option>
                  {availableStops
                    .filter((stop) => stop !== form.startStop)
                    .map((stop) => (
                      <option key={stop} value={stop}>{stop}</option>
                    ))}
                  <option value="__add_new_stop__">+ Add a new stop...</option>
                </select>
              )}
            </div>



            <div className="space-y-2">
              <Label htmlFor="intermediateStops">Ordered intermediate stops</Label>
              <textarea
                id="intermediateStops"
                value={intermediateStopsText}
                onChange={(event) => setIntermediateStopsText(event.target.value)}
                placeholder={"One per line: Stop name | normal_road_waypoint | true | true\nInterchange | expressway_interchange | false | false"}
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: name | type | boarding allowed | alighting allowed. Verify passenger permissions against the operator service; interchanges cannot be stops.
              </p>
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
                      updateDuration(e.target.value, durationMinutes);
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
                      updateDuration(durationHours, e.target.value);
                    }}
                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>
            </div>



            {/* Fare */}
            <div className="space-y-2">
              <Label htmlFor="fare" className="text-sm font-medium">
                Fare to destination (LKR)
              </Label>
              <Input
                id="fare"
                name="fare"
                type="number"
                min="0"
                step="0.01"
                value={form.fare}
                onChange={handleChange}
                placeholder="e.g., 450"
                className="h-11 transition-all focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-muted-foreground">
                Optional. This fare is charged when a passenger books a ticket on this route.
              </p>
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