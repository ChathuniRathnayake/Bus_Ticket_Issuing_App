import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Search, Ticket, User, LogOut, Bus, Calendar, CreditCard, Clock, MapPin, 
  Sun, Moon, ArrowRight 
} from "lucide-react";

const qrPattern = ["1110101", "1011101", "1110101", "0001010", "1101101", "1010011", "1110111"];

function QrPlaceholder() {
  return (
    <div className="grid aspect-square w-16 grid-cols-7 gap-[2px] rounded bg-white p-1" aria-label="Ticket QR placeholder">
      {qrPattern.flatMap((row, rowIndex) => [...row].map((cell, cellIndex) => (
        <span key={`${rowIndex}-${cellIndex}`} className={cell === "1" ? "bg-zinc-900" : "bg-white"} />
      )))}
    </div>
  );
}

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("userBookings") || "[]"));
  const [routes, setRoutes] = useState([]);
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [countdown, setCountdown] = useState("");

  // Fetch routes from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/route", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRoutes(data);
        }
      } catch (error) {
        console.error("Failed to fetch routes:", error);
      }
    };
    fetchRoutes();
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    if (!upcomingBooking) return;

    const calculateTimer = () => {
      const route = routes.find((r) => r.routeId === upcomingBooking.routeId);
      if (!route) return;

      const bookingDate = new Date(`${route.date}T${route.startTime}`);
      const now = new Date();
      const diff = bookingDate - now;

      if (diff <= 0) {
        setCountdown("Journey Started!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimer();
    const timer = setInterval(calculateTimer, 1000);
    return () => clearInterval(timer);
  }, [upcomingBooking, routes]);

  // Load bookings and find next upcoming
  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");

    // Find next upcoming booking
    if (savedBookings.length > 0 && routes.length > 0) {
      const now = new Date();
      const upcoming = savedBookings
        .map((booking) => {
          const route = routes.find((r) => r.routeId === booking.routeId);
          return { ...booking, route };
        })
        .filter((b) => b.route && new Date(`${b.route.date}T${b.route.startTime}`) > now)
        .sort((a, b) => new Date(`${a.route.date}T${a.route.startTime}`) - new Date(`${b.route.date}T${b.route.startTime}`))[0];

      // This effect synchronizes derived booking state with localStorage and route data.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpcomingBooking(upcoming || null);
    }
  }, [routes]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger-login");
      return;
    }

    const savedProfile = localStorage.getItem("passengerProfile");
    if (savedProfile) {
      // Profile state is restored from the persisted session on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(JSON.parse(savedProfile));
    }

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [navigate, darkMode]);

  // ── Keep bookings in sync when localStorage changes (e.g. after cancellation) ──
  useEffect(() => {
    const syncBookings = () => {
      const savedBookings = JSON.parse(localStorage.getItem("userBookings")) || [];
      setBookings(savedBookings);
    };

    window.addEventListener("storage", syncBookings);
    return () => window.removeEventListener("storage", syncBookings);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Welcome Back, {profile?.firstName ? profile.firstName : "Traveler"}!
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Where are you heading today?
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-card border rounded-2xl px-4 py-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">UPCOMING TRIPS</p>
                  <p className="text-5xl font-bold mt-3 animate-count">02</p>
                </div>
                <Calendar className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* ── TOTAL BOOKINGS: now reads live from bookings state ── */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">TOTAL BOOKINGS</p>
                  <p className="text-5xl font-bold mt-3 animate-count">
                    {String(bookings.length).padStart(2, "0")}
                  </p>
                </div>
                <Ticket className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-sm font-medium">WALLET BALANCE</p>
                  <p className="text-5xl font-bold mt-3 animate-count">2,450</p>
                  <p className="text-sm text-amber-200">LKR</p>
                </div>
                <CreditCard className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            className="group relative cursor-pointer overflow-hidden border border-blue-200 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-cyan-400 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400"
            onClick={() => navigate("/passenger-dashboard/search-buses")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Search Buses</h3>
              <p className="text-muted-foreground">Find and book your next journey</p>
              <ArrowRight className="mt-6 h-5 w-5 text-blue-500 group-hover:translate-x-1 transition" />
            </CardContent>
          </Card>

          <Card 
            className="group relative cursor-pointer overflow-hidden border border-violet-200 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-violet-500 before:to-fuchsia-400 hover:-translate-y-1 hover:shadow-xl hover:border-violet-400"
            onClick={() => navigate("/passenger-dashboard/my-bookings")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-violet-100 dark:bg-violet-950 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="h-10 w-10 text-violet-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">My Bookings</h3>
              <p className="text-muted-foreground">View all your tickets</p>
              <ArrowRight className="mt-6 h-5 w-5 text-violet-500 group-hover:translate-x-1 transition" />
            </CardContent>
          </Card>

          <Card 
            className="group relative cursor-pointer overflow-hidden border border-emerald-200 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-400 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400"
            onClick={() => navigate("/passenger-dashboard/profile")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">My Profile</h3>
              <p className="text-muted-foreground">Manage your account</p>
              <ArrowRight className="mt-6 h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition" />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trip Highlight */}
        {upcomingBooking && upcomingBooking.route ? (
          <Card className="mb-10 border-0 shadow-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Clock className="h-7 w-7 text-blue-600" />
                Your Next Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="overflow-hidden rounded-xl border border-dashed border-blue-300 bg-card shadow-sm">
                <div className="grid md:grid-cols-[1fr_auto]">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Boarding pass</p>
                        <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{upcomingBooking.route.startStop} <span className="text-blue-500">→</span> {upcomingBooking.route.endStop}</h3>
                      </div>
                      <QrPlaceholder />
                    </div>
                    <div className="mt-7 grid grid-cols-2 gap-5 border-t border-dashed pt-5 sm:grid-cols-3">
                      <div><p className="text-xs uppercase text-muted-foreground">Departure</p><p className="mt-1 text-xl font-semibold">{upcomingBooking.route.startTime}</p></div>
                      <div><p className="text-xs uppercase text-muted-foreground">Travel date</p><p className="mt-1 text-sm font-semibold">{upcomingBooking.route.date}</p></div>
                      <div><p className="text-xs uppercase text-muted-foreground">Bus · Seat</p><p className="mt-1 text-sm font-semibold">{upcomingBooking.busNo} · {upcomingBooking.seat}</p></div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center border-t border-dashed border-blue-300 bg-blue-50 p-6 dark:bg-blue-950/30 md:w-56 md:border-l md:border-t-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Departure in</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{countdown || "Calculating..."}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Bus className="h-4 w-4" />TicketGo · Passenger</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-10 border-0 shadow-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Clock className="h-7 w-7 text-gray-600" />
                Your Next Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg">No upcoming bookings</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/passenger-dashboard/search-buses")}
                >
                  Search & Book a Bus
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest travels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-border">
              {[
                { route: "Negombo → Colombo Fort", date: "Yesterday", status: "Completed", bus: "NB-2341" },
                { route: "Kandy → Nuwara Eliya", date: "3 days ago", status: "Completed", bus: "NB-7890" },
                { route: "Colombo → Galle", date: "Feb 25, 2026", status: "Completed", bus: "NB-1122" },
              ].map((item, i) => (
                <div key={`${item.bus}-${i}`} className="relative flex items-center justify-between gap-4 border-b py-5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-card bg-emerald-100 dark:bg-emerald-900">
                      <Bus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.route}</p>
                      <p className="text-sm text-muted-foreground">{item.bus} • {item.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-4 py-1.5">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}