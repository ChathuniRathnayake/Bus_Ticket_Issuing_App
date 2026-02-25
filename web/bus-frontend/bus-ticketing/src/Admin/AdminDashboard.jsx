import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bus, Map, ShieldCheck, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Conductors",
      icon: Users,
      color: "blue",
      add: "/admin-dashboard/add-conductor",
      manage: "/admin-dashboard/manage-conductors",
    },
    {
      title: "Buses",
      icon: Bus,
      color: "violet",
      add: "/admin-dashboard/add-bus",
      manage: "/admin-dashboard/manage-buses",
    },
    {
      title: "Routes",
      icon: Map,
      color: "emerald",
      add: "/admin-dashboard/add-route",
      manage: "/admin-dashboard/manage-routes",
    },
    {
      title: "Admins",
      icon: ShieldCheck,
      color: "amber",
      add: "/admin-dashboard/add-admin",
      manage: "/admin-dashboard/manage-admins",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground mt-3">Real-time Bus Ticketing System</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin-login")} className="gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec, i) => (
          <Card key={i} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${sec.color}-100 text-${sec.color}-600`}>
                <sec.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl mt-4">{sec.title}</CardTitle>
              <CardDescription>Manage {sec.title.toLowerCase()} in the system</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-2">
              <Button onClick={() => navigate(sec.add)} variant="outline" className="h-12">
                + Add New
              </Button>
              <Button onClick={() => navigate(sec.manage)} className="h-12">
                Manage All
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}