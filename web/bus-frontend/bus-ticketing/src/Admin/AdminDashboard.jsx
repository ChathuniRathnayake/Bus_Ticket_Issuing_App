import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bus, Map, ShieldCheck, Calendar, Ticket, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 🎨 Custom brand color styles
  const colorStyles = {
    blue: {
      iconBg: "bg-gradient-to-br from-blue-500 to-sky-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800",
    },
    violet: {
      iconBg: "bg-gradient-to-br from-violet-500 to-indigo-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800",
    },
    emerald: {
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800",
    },
    amber: {
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800",
    },
    orange: {
      iconBg: "bg-gradient-to-br from-orange-500 to-rose-600",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-orange-600 to-rose-700 hover:from-orange-700 hover:to-rose-800",
    },
    rose: {
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",
      iconText: "text-white",
      btn: "bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800",
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
    <div className="mx-auto max-w-7xl p-6 animate-fade-in">
      
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Real-time Bus Ticketing System</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{String(sections.length).padStart(2, "0")}</span>
          <div><p className="text-sm font-semibold">Management areas</p><p className="text-xs text-muted-foreground">System overview</p></div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((sec, i) => {
          const styles = colorStyles[sec.color];
          const hasAdd = Boolean(sec.add);

          return (
            <Card 
              key={i} 
              className="group overflow-hidden rounded-xl border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
  );
}