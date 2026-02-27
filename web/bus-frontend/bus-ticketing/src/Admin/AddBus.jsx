import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bus } from "lucide-react";

export default function AddBus({ buses, setBuses, routes }) {
  const [form, setForm] = useState({
    busId: "",
    routeId: "",
    totalSeats: "",
    busNo: "",
    status: "Active",
    // Seat layout configuration
    leftColumns: "2",      // seats per row on LEFT (1, 2, 3)
    rightColumns: "2",     // seats per row on RIGHT (1, 2, 3)
    leftRows: "10",        // number of rows on LEFT side
    rightRows: "10",       // number of rows on RIGHT side (can be different)
    hasFrontSingle: "no",  // yes/no
    hasBackFullRow: "yes", // yes/no
    backRowSeats: "5",     // seats in back row if yes
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate expected total seats from layout config
  const calculateExpectedSeats = () => {
    const leftCols = parseInt(form.leftColumns) || 0;
    const rightCols = parseInt(form.rightColumns) || 0;
    const leftR = parseInt(form.leftRows) || 0;
    const rightR = parseInt(form.rightRows) || 0;

    let total = (leftCols * leftR) + (rightCols * rightR);

    if (form.hasFrontSingle === "yes") {
      total += 1;
    }

    if (form.hasBackFullRow === "yes") {
      total += parseInt(form.backRowSeats) || 0;
    }

    return total;
  };

  // ✅ BACKEND CONNECTED SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { busId, routeId, totalSeats, busNo, status } = form;

    if (!busId || !routeId || !totalSeats || !busNo || !status) {
      return alert("Please fill all required fields");
    }

    const expected = calculateExpectedSeats();
    const selected = parseInt(totalSeats);

    if (expected !== selected) {
      if (
        !window.confirm(
          `Calculated seats from layout (${expected}) do not match selected total (${selected}). Continue anyway?`
        )
      ) {
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/bus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          calculatedSeats: expected,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(`Bus Added Successfully!\nBus ID: ${busId}`);

      // Reset form (same as your original)
      setForm({
        busId: "",
        routeId: "",
        totalSeats: "",
        busNo: "",
        status: "Active",
        leftColumns: "2",
        rightColumns: "2",
        leftRows: "10",
        rightRows: "10",
        hasFrontSingle: "no",
        hasBackFullRow: "yes",
        backRowSeats: "5",
      });

      navigate("/admin-dashboard/manage-buses");

    } catch (error) {
      console.error(error);
      alert("Failed to add bus");
    }

    setLoading(false);
  };

  const seatOptions = ["30", "42", "46", "52", "54"];

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border-border">
        <CardHeader className="text-center">
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
            {/* Bus ID */}
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

            {/* Route Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="routeId" className="text-sm font-medium">Select Route</Label>
              <select
                id="routeId"
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                required
              >
                <option value="">-- Select Route --</option>
                {routes.map((route) => (
                  <option key={route.routeId} value={route.routeId}>
                    {route.startStop} → {route.endStop} ({route.routeName || route.routeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Total Seats Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="totalSeats" className="text-sm font-medium">Total Seats</Label>
              <select
                id="totalSeats"
                name="totalSeats"
                value={form.totalSeats}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                required
              >
                <option value="">-- Select Number of Seats --</option>
                {seatOptions.map((seats) => (
                  <option key={seats} value={seats}>
                    {seats} Seats
                  </option>
                ))}
              </select>
            </div>

            {/* ─────────────────────────────────────── */}
            {/* Seat Layout Configuration */}
            {/* ─────────────────────────────────────── */}

            <div className="border-t pt-4 mt-2 space-y-4">
              <Label className="text-base font-medium">Customize Seat Layout</Label>

              {/* Left & Right Columns per Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leftColumns" className="text-sm">Left Side Seats per Row</Label>
                  <select
                    id="leftColumns"
                    name="leftColumns"
                    value={form.leftColumns}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="rightColumns" className="text-sm">Right Side Seats per Row</Label>
                  <select
                    id="rightColumns"
                    name="rightColumns"
                    value={form.rightColumns}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>

              {/* Number of Rows – now separate for left & right */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leftRows" className="text-sm">Number of Rows (Left Side)</Label>
                  <Input
                    id="leftRows"
                    name="leftRows"
                    type="number"
                    min="5"
                    max="30"
                    value={form.leftRows}
                    onChange={handleChange}
                    className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <Label htmlFor="rightRows" className="text-sm">Number of Rows (Right Side)</Label>
                  <Input
                    id="rightRows"
                    name="rightRows"
                    type="number"
                    min="5"
                    max="30"
                    value={form.rightRows}
                    onChange={handleChange}
                    className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              {/* Front & Back Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hasFrontSingle" className="text-sm">Front Single Seat?</Label>
                  <select
                    id="hasFrontSingle"
                    name="hasFrontSingle"
                    value={form.hasFrontSingle}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="hasBackFullRow" className="text-sm">Back Full Row?</Label>
                  <select
                    id="hasBackFullRow"
                    name="hasBackFullRow"
                    value={form.hasBackFullRow}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9966CC] transition-all"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {form.hasBackFullRow === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="backRowSeats" className="text-sm">Seats in Back Row</Label>
                  <Input
                    id="backRowSeats"
                    name="backRowSeats"
                    type="number"
                    min="4"
                    max="8"
                    value={form.backRowSeats}
                    onChange={handleChange}
                    className="h-11 transition-all focus:ring-2 focus:ring-[#9966CC]"
                    placeholder="usually 5"
                  />
                </div>
              )}

              {/* Live Preview */}
              <div className="text-sm mt-2 p-3 bg-muted/50 rounded-md">
                <strong>Calculated seats from layout:</strong> {calculateExpectedSeats()}<br />
                {calculateExpectedSeats() !== parseInt(form.totalSeats || 0) && (
                  <span className="text-red-600">
                    → Does not match selected total seats ({form.totalSeats})
                  </span>
                )}
              </div>
            </div>

            {/* Bus Number */}
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

            {/* Status */}
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
                <ArrowLeft className="h-4 w-4" /> Back
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