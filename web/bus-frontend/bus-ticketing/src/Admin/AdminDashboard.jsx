import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bus, Map, ShieldCheck, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 🎨 Custom brand color styles
  const colorStyles = {
    blue: {
      iconBg: "bg-[#318CE7]/20",
      iconText: "text-[#318CE7]",
      btn: "bg-[#318CE7] hover:bg-[#2b7cc9]",
    },
    violet: {
      iconBg: "bg-[#9966CC]/20",
      iconText: "text-[#9966CC]",
      btn: "bg-[#9966CC] hover:bg-[#875bb5]",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      btn: "bg-emerald-600 hover:bg-emerald-700",
    },
    amber: {
      iconBg: "bg-[#A0785A]/20",
      iconText: "text-[#A0785A]",
      btn: "bg-[#A0785A] hover:bg-[#8b654b]",
    },
  };

  const sections = [
    { title: "Conductors", icon: Users, color: "blue",   add: "/admin-dashboard/add-conductor", manage: "/admin-dashboard/manage-conductors" },
    { title: "Buses",      icon: Bus,    color: "violet", add: "/admin-dashboard/add-bus",      manage: "/admin-dashboard/manage-buses" },
    { title: "Routes",     icon: Map,    color: "emerald",add: "/admin-dashboard/add-route",    manage: "/admin-dashboard/manage-routes" },
    { title: "Admins",     icon: ShieldCheck, color: "amber", add: "/admin-dashboard/add-admin", manage: "/admin-dashboard/manage-admins" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background/50 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Real-time Bus Ticketing System</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin-login")} 
          className="h-11 gap-2 hover:bg-red-50 hover:shadow-md transition-all duration-300 cursor-pointer border-red-200 text-red-700"
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec, i) => {
          const styles = colorStyles[sec.color];

          return (
            <Card 
              key={i} 
              className="hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-border rounded-2xl overflow-hidden"
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${styles.iconBg} ${styles.iconText}`}>
                  <sec.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mt-4 font-semibold text-center">{sec.title}</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Manage {sec.title.toLowerCase()} in the system
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-3 pt-2 pb-6">
                <Button 
                  onClick={() => navigate(sec.add)} 
                  variant="outline" 
                  className="h-12 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer font-medium"
                >
                  + Add New
                </Button>
                <Button 
                  onClick={() => navigate(sec.manage)} 
                  className={`h-12 text-white transition-all duration-300 cursor-pointer font-medium ${styles.btn}`}
                >
                  Manage All
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}