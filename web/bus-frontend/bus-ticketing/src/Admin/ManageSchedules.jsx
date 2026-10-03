import { Fragment, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleSlash2,
  Eye,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

const MAX_VISIBLE_STOPS = 5;
const PAGE_SIZE = 10;

function statusBadgeClass(status) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";
  switch (String(status || "").toLowerCase()) {
    case "on the way":
      return `${base} bg-blue-50 text-blue-700 ring-blue-200`;
    case "expired":
      return `${base} bg-red-50 text-red-700 ring-red-200`;
    case "active":
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    case "cancelled":
      return `${base} bg-red-50 text-red-700 ring-red-200`;
    case "inactive":
      return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
    default:
      return `${base} bg-slate-50 text-slate-500 ring-slate-200`;
  }
}

function getScheduleDepartureTime(schedule) {
  const departureAt = new Date(`${schedule.date || ""}T${schedule.departureTime || ""}`);
  return Number.isNaN(departureAt.getTime()) ? null : departureAt;
}

function getScheduleArrivalTime(schedule) {
  const departureAt = getScheduleDepartureTime(schedule);
  const duration = String(schedule.routeDuration || "").match(/^(\d+):([0-5]?\d)$/);
  if (!departureAt || !duration) return null;

  const durationMinutes = Number(duration[1]) * 60 + Number(duration[2]);
  return new Date(departureAt.getTime() + durationMinutes * 60_000);
}

function getScheduleDisplayStatus(schedule, now) {
  const status = String(schedule.status || "").trim();
  if (status.toLowerCase() !== "active") return status || "Unknown";

  const departureAt = getScheduleDepartureTime(schedule);
  if (!departureAt || now < departureAt) return status;

  const arrivalAt = getScheduleArrivalTime(schedule);
  if (!arrivalAt) return status;
  return now < arrivalAt ? "On the way" : "Expired";
}

function matchesScheduleStatus(schedule, statusFilter, now) {
  if (!statusFilter) return true;

  const storedStatus = String(schedule.status || "").toLowerCase();
  if (statusFilter === "Active") return storedStatus === "active";
  if (statusFilter === "Inactive") return storedStatus === "inactive";
  if (statusFilter === "Cancelled") return storedStatus === "cancelled";
  if (statusFilter === "Upcoming") {
    const departureAt = getScheduleDepartureTime(schedule);
    return storedStatus === "active" && departureAt && departureAt > now;
  }
  return getScheduleDisplayStatus(schedule, now) === statusFilter;
}

function StatCard({ icon, label, value, accent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${label.toLowerCase()} schedules (${value})`}
      className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-none text-slate-900">{value}</p>
        <p className="mt-1.5 truncate text-sm text-slate-500">{label}</p>
      </div>
    </button>
  );
}

export default function ManageSchedules() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const [search, setSearch] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [expandedStops, setExpandedStops] = useState({});
  const [form, setForm] = useState({
    scheduleId: "",
    busId: "",
    routeId: "",
    date: "",
    departureTime: "",
    status: "",
  });

  const loadData = useCallback(async () => {
    try {
      if (!token) {
        navigate("/admin-login");
        return;
      }

      setLoading(true);

      const [scheduleRes, busRes, routeRes] = await Promise.all([
        axios.get("/api/schedule", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/bus", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/route", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const busesData = busRes.data;
      const routesData = routeRes.data;

      setBuses(busesData);
      setRoutes(routesData);

      const enriched = scheduleRes.data.map((schedule) => {
        const bus = busesData.find((b) => b.id === schedule.busId);
        const route = routesData.find(
          (r) => r.routeId === schedule.routeId || r.id === schedule.routeId
        );
        const stopNames = Array.isArray(route?.stops)
          ? route.stops.map((stop) => (typeof stop === "string" ? stop : stop.name)).filter(Boolean)
          : [];

        return {
          ...schedule,
          busNo: bus?.busNo || "Unknown",
          routeStart: route?.startStop || "Unknown",
          routeEnd: route?.endStop || "Unknown",
          routeName: route ? `${route.startStop} → ${route.endStop}` : "Unknown",
          routeDuration: route?.duration || "-",
          allStops: stopNames,
          intermediateStops: stopNames.length > 2 ? stopNames.slice(1, -1) : [],
        };
      });

      enriched.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.departureTime}`);
        const dateB = new Date(`${b.date}T${b.departureTime}`);
        return dateA - dateB;
      });

      setSchedules(enriched);
    } catch (error) {
      console.error(error);
      alert("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleEdit = (schedule) => {
    setViewId(null);
    setEditId(schedule.id);
    setForm({
      scheduleId: schedule.scheduleId,
      busId: schedule.busId,
      routeId: schedule.routeId,
      date: schedule.date,
      departureTime: schedule.departureTime,
      status: schedule.status,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ scheduleId: "", busId: "", routeId: "", date: "", departureTime: "", status: "" });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`/api/schedule/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cancelEdit();
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete schedule");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFromFilter("");
    setToFilter("");
    setDateFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const showScheduleCategory = (selectedStatus) => {
    resetFilters();
    setStatusFilter(selectedStatus);
    window.requestAnimationFrame(() => {
      document.getElementById("admin-schedules-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const stats = {
    total: schedules.length,
    active: schedules.filter((s) => s.status === "Active").length,
    upcoming: schedules.filter((s) => {
      const departureAt = getScheduleDepartureTime(s);
      return s.status === "Active" && departureAt && departureAt > currentTime;
    }).length,
    inactive: schedules.filter((s) => s.status === "Inactive").length,
    onTheWay: schedules.filter((s) => getScheduleDisplayStatus(s, currentTime) === "On the way").length,
    expired: schedules.filter((s) => getScheduleDisplayStatus(s, currentTime) === "Expired").length,
  };

  const fromOptions = [...new Set(schedules.map((s) => s.routeStart))].sort();
  const toOptions = [...new Set(schedules.map((s) => s.routeEnd))].sort();

  const filtered = schedules.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      [s.scheduleId, s.id, s.busNo, s.routeName, s.date, getScheduleDisplayStatus(s, currentTime)]
        .some((value) => String(value || "").toLowerCase().includes(q));
    const matchesFrom = !fromFilter || s.routeStart === fromFilter;
    const matchesTo = !toFilter || s.routeEnd === toFilter;
    const matchesDate = !dateFilter || s.date === dateFilter;
    const matchesStatus = matchesScheduleStatus(s, statusFilter, currentTime);
    return matchesSearch && matchesFrom && matchesTo && matchesDate && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const toggleStops = (id) =>
    setExpandedStops((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="h-10 gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Bus Schedules</h2>
            <p className="mt-0.5 text-sm text-slate-500">Plan departures, assign buses and monitor route status.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/admin-dashboard/add-schedule")} className="gap-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Schedule
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<Bus className="h-5 w-5 text-blue-600" />} label="Total Schedules" value={stats.total} accent="bg-blue-50" onClick={() => showScheduleCategory("")} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Active" value={stats.active} accent="bg-emerald-50" onClick={() => showScheduleCategory("Active")} />
        <StatCard icon={<CalendarClock className="h-5 w-5 text-amber-600" />} label="Upcoming Departures" value={stats.upcoming} accent="bg-amber-50" onClick={() => showScheduleCategory("Upcoming")} />
        <StatCard icon={<CircleSlash2 className="h-5 w-5 text-slate-500" />} label="Inactive" value={stats.inactive} accent="bg-slate-100" onClick={() => showScheduleCategory("Inactive")} />
        <StatCard icon={<Bus className="h-5 w-5 text-blue-600" />} label="On the way" value={stats.onTheWay} accent="bg-blue-50" onClick={() => showScheduleCategory("On the way")} />
        <StatCard icon={<CalendarDays className="h-5 w-5 text-rose-600" />} label="Expired" value={stats.expired} accent="bg-rose-50" onClick={() => showScheduleCategory("Expired")} />
      </div>

      {/* Filter bar */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardContent className="grid grid-cols-1 items-end gap-4 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto]">
          <div className="min-w-0 space-y-1">
            <label className="block text-xs font-medium text-slate-600">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Schedule ID, route or bus number..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-slate-600">From</label>
            <select value={fromFilter} onChange={(e) => { setFromFilter(e.target.value); setPage(1); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Locations</option>
              {fromOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-slate-600">To</label>
            <select value={toFilter} onChange={(e) => { setToFilter(e.target.value); setPage(1); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Locations</option>
              {toOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-slate-600">Date</label>
            <Input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="w-full min-w-0" />
          </div>

          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming Departures</option>
              <option value="On the way">On the way</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="h-10 gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card id="admin-schedules-table" className="scroll-mt-4 rounded-xl border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="py-12 text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <p className="text-muted-foreground">No schedules match your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-white hover:bg-white">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Schedule ID</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bus</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Route</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Intermediate Stops</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duration</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Departure</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Arrival</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                      <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((s) => {
                      const displayStatus = getScheduleDisplayStatus(s, currentTime);
                      const visibleStops = expandedStops[s.id]
                        ? s.intermediateStops
                        : s.intermediateStops.slice(0, MAX_VISIBLE_STOPS);
                      const hiddenCount = s.intermediateStops.length - MAX_VISIBLE_STOPS;

                      return (
                        <Fragment key={s.id}>
                          <TableRow className="border-b border-slate-100 align-middle transition-colors last:border-0 hover:bg-slate-50">
                            <TableCell>
                              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{s.scheduleId || s.id}</span>
                            </TableCell>
                            <TableCell className="font-medium text-slate-700">{s.busNo}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span className="font-medium">{s.routeStart}</span>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                                <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                                <span className="font-medium">{s.routeEnd}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {s.intermediateStops.length > 0 ? (
                                <div className="flex max-w-xs flex-wrap items-center gap-1">
                                  {visibleStops.map((name, index) => (
                                    <span key={`${s.id}-stop-${index}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                                      {name}
                                    </span>
                                  ))}
                                  {hiddenCount > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleStops(s.id)}
                                      className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                                    >
                                      {expandedStops[s.id] ? "Show less" : `+${hiddenCount} more`}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">Direct</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{s.routeDuration}</TableCell>
                            <TableCell className="whitespace-nowrap">{s.date}</TableCell>
                            <TableCell className="whitespace-nowrap font-medium">{s.departureTime}</TableCell>
                            <TableCell className="whitespace-nowrap font-medium">
                              {getScheduleArrivalTime(s)?.toLocaleTimeString("en-LK", {
                                timeZone: "Asia/Colombo",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) || "—"}
                            </TableCell>
                            <TableCell><span className={statusBadgeClass(displayStatus)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{displayStatus}</span></TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" title="View details" className="text-blue-600 hover:bg-blue-50" onClick={() => { setEditId(null); setViewId(viewId === s.id ? null : s.id); }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Edit" className="text-slate-600 hover:bg-slate-100" onClick={() => handleEdit(s)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Delete" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {viewId === s.id && (
                            <TableRow className="bg-slate-50">
                              <TableCell colSpan={10}>
                                <div className="space-y-2 py-1">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Full stop sequence</p>
                                  <div className="flex flex-wrap items-center gap-1">
                                    {s.allStops.map((name, index) => (
                                      <Fragment key={`${s.id}-all-${index}`}>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${index === 0 ? "bg-emerald-100 text-emerald-700" : index === s.allStops.length - 1 ? "bg-rose-100 text-rose-700" : "bg-white text-slate-600 border border-slate-200"}`}>
                                          {name}
                                        </span>
                                        {index < s.allStops.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                                      </Fragment>
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Bus {s.busNo} · {s.routeDuration} estimated · {s.date} at {s.departureTime} · {displayStatus}
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {editId === s.id && (
                            <TableRow className="bg-blue-50/40">
                              <TableCell colSpan={10}>
                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[repeat(5,minmax(0,1fr))]">
                                  <div className="min-w-0 space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Bus</label>
                                    <select value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                                      {buses.map((b) => <option key={b.id} value={b.id}>{b.busNo}</option>)}
                                    </select>
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Route</label>
                                    <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                                      {routes.map((route) => (
                                        <option key={route.id} value={route.id}>{route.routeName || `${route.startStop} → ${route.endStop}`}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Date</label>
                                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full min-w-0" />
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Departure</label>
                                    <Input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="w-full min-w-0" />
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  <div className="flex gap-2 md:col-span-5 md:mt-1">
                                    <Button size="sm" onClick={() => handleSave(s.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Showing {rangeStart} to {rangeEnd} of {filtered.length} schedules
                </p>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Button
                      key={n}
                      size="icon"
                      variant={n === currentPage ? "default" : "outline"}
                      className={n === currentPage ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </Button>
                  ))}
                  <Button size="icon" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
