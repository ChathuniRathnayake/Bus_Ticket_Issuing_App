import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Ticket, 
  User, 
  LogOut, 
  Bus, 
  Calendar, 
  CreditCard, 
  Clock, 
  MapPin, 
  Sun, 
  Moon 
} from "lucide-react";

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState(null);

  // Load profile and check token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger-login");
      return;
    }

    const savedProfile = localStorage.getItem("passengerProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [navigate, darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("passengerProfile");
    navigate("/passenger-login");
  };

  // Mock data (replace with real data later)
  const upcomingTrip = {
    busNo: "NB-4567",
    route: "Colombo → Kandy",
    date: "Tomorrow, 10:30 AM",
    seat: "A12",
  };

  const stats = {
    totalBookings: 8,
    upcomingTrips: 2,
    walletBalance: "LKR 2,450.00",
  };

  const recentBookings = [
    { id: "BK123", route: "Negombo → Colombo", date: "Feb 20, 2025", status: "Completed" },
    { id: "BK456", route: "Colombo → Galle", date: "Feb 15, 2025", status: "Completed" },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-950" : "bg-gradient-to-br from-zinc-50 to-zinc-100"} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Welcome back{profile?.firstName ? `, ${profile.firstName}` : ""}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Ready for your next journey?
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon className="h-5 w-5 text-blue-400" />
            </div>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Upcoming Trips</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats.upcomingTrips}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Bookings</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {stats.totalBookings}
                  </p>
                </div>
                <Ticket className="h-10 w-10 text-emerald-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-none shadow-lg sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Wallet Balance</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {stats.walletBalance}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card 
            className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-blue-200"
            onClick={() => navigate("/passenger-dashboard/search-buses")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Buses</h3>
              <p className="text-muted-foreground">Find and book your next trip</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-violet-200"
            onClick={() => alert("My Bookings - Coming soon!")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">My Bookings</h3>
              <p className="text-muted-foreground">View upcoming & past trips</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-emerald-200"
            onClick={() => navigate("/passenger-dashboard/profile")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">My Profile</h3>
              <p className="text-muted-foreground">Update your details & photo</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trip Card */}
        <Card className="mb-10 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Next Upcoming Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTrip ? (
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-xl font-bold">{upcomingTrip.route}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Bus className="h-4 w-4" /> Bus No: {upcomingTrip.busNo}
                    </p>
                    <p className="text-lg font-medium mt-3">{upcomingTrip.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-600 text-white px-4 py-1.5 text-base">
                      Seat {upcomingTrip.seat}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming trips. Start searching for buses!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your last few trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border"
                >
                  <div>
                    <h4 className="font-medium">{booking.route}</h4>
                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                  </div>
                  <Badge
                    variant={booking.status === "Completed" ? "default" : "secondary"}
                    className="px-4 py-1.5"
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}