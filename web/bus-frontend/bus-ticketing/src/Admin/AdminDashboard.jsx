import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bus, Map, ShieldCheck, Calendar, Ticket } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 🎨 Custom brand color styles
  const colorStyles = {
    blue: {
      iconBg: "bg-gradient-to-br from-blue-500 to-sky-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800",
      border: "border-blue-100 hover:border-blue-300 before:from-blue-500 before:to-sky-400",
    },
    violet: {
      iconBg: "bg-gradient-to-br from-violet-500 to-indigo-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800",
      border: "border-violet-100 hover:border-violet-300 before:from-violet-500 before:to-indigo-400",
    },
    emerald: {
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800",
      border: "border-emerald-100 hover:border-emerald-300 before:from-emerald-500 before:to-teal-400",
    },
    amber: {
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800",
      border: "border-amber-100 hover:border-amber-300 before:from-amber-500 before:to-orange-400",
    },
    orange: {
      iconBg: "bg-gradient-to-br from-orange-500 to-rose-600",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-orange-600 to-rose-700 hover:from-orange-700 hover:to-rose-800",
      border: "border-orange-100 hover:border-orange-300 before:from-orange-500 before:to-rose-400",
    },
    rose: {
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800",
      border: "border-rose-100 hover:border-rose-300 before:from-rose-500 before:to-pink-400",
    },
  };

  const sections = [
    { title: "Conductors", icon: Users, color: "blue",   add: "/admin-dashboard/add-conductor", manage: "/admin-dashboard/manage-conductors" },
    { title: "Buses",      icon: Bus,    color: "violet", add: "/admin-dashboard/add-bus",      manage: "/admin-dashboard/manage-buses" },
    { title: "Routes",     icon: Map,    color: "emerald",add: "/admin-dashboard/add-route",    manage: "/admin-dashboard/manage-routes" },
    { title: "Schedules",  icon: Calendar, color: "orange", add: "/admin-dashboard/add-schedule", manage: "/admin-dashboard/manage-schedules" },
    { title: "Admins",     icon: ShieldCheck, color: "amber", add: "/admin-dashboard/add-admin", manage: "/admin-dashboard/manage-admins" },
    // 🎫 Bookings: no "add" — an admin can only VIEW bookings, not create one manually
    { title: "Bookings",   icon: Ticket, color: "rose", manage: "/admin-dashboard/manage-bookings" },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Hero / welcome banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 px-6 py-10 text-white mb-10">
        <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">TicketGo</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-zinc-400">Real-time Bus Ticketing System</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
              {String(sections.length).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-semibold">Management areas</p>
              <p className="text-xs text-zinc-400">System overview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((sec, i) => {
            const styles = colorStyles[sec.color];
            const hasAdd = Boolean(sec.add);

            return (
              <Card
                key={i}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r ${styles.border}`}
              >
                <CardHeader>
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-105 ${styles.iconBg} ${styles.iconText}`}>
                    <sec.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl mt-4 font-semibold text-center">{sec.title}</CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Manage {sec.title.toLowerCase()} in the system
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 pb-6">
                  {hasAdd && (
                    <Button
                      onClick={() => navigate(sec.add)}
                      variant="outline"
                      className="h-11 w-full gap-2 font-medium transition-colors"
                    >
                      + Add New
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate(sec.manage)}
                    className={`h-11 w-full text-white shadow-sm transition-all duration-300 ${styles.btn}`}
                  >
                    {hasAdd ? "Manage All" : "View All Bookings"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}