import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { fetchPassengerBookings } from "@/utils/bookings";
import { 
  Search, Ticket, User, LogOut, Bus, Calendar, Clock, MapPin, 
  Sun, Moon, ArrowRight 
} from "lucide-react";

function isConfirmedBooking(booking) {
  return ["CONFIRMED", "BOOKED"].includes(String(booking.status || "").toUpperCase())
    || String(booking.paymentStatus || "").toUpperCase() === "SUCCEEDED";
}

function isProcessingBooking(booking) {
  return ["PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(String(booking.status || "").toUpperCase());
}

function getDepartureDate(booking, route) {
  const date = booking.date || route?.date;
  const time = booking.departureTime || route?.startTime;
  if (!date || !time) return null;

  const departure = new Date(`${date}T${time}`);
  return Number.isNaN(departure.getTime()) ? null : departure;
}

function getPendingPayment() {
  try {
    return JSON.parse(localStorage.getItem("pendingPayment") || "null");
  } catch {
    return null;
  }
}

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("userBookings") || "[]"));
  const [pendingPayment, setPendingPayment] = useState(getPendingPayment);
  const [routes, setRoutes] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [countdown, setCountdown] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const confirmedBookings = bookings.filter(isConfirmedBooking);
  const processingBookings = bookings.filter(isProcessingBooking);
  const totalBookingCount = confirmedBookings.length + processingBookings.length + (
    pendingPayment && !bookings.some((booking) => booking.bookingId === pendingPayment.bookingId) ? 1 : 0
  );
  const upcomingBookingCount = confirmedBookings.filter((booking) => {
    const route = routes.find((item) => item.routeId === booking.routeId);
    const departure = getDepartureDate(booking, route);
    return departure && departure > currentTime;
  }).length;
  const expiredBookings = confirmedBookings
    .map((booking) => {
      const route = routes.find((item) => item.routeId === booking.routeId);
      return { ...booking, route, departureAt: getDepartureDate(booking, route), displayStatus: "expired" };
    })
    .filter((booking) => booking.departureAt && booking.departureAt <= currentTime)
    .sort((first, second) => second.departureAt - first.departureAt);
  const recentExpiredBookings = expiredBookings.slice(0, 5);

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

  useEffect(() => {
    let active = true;
    const syncBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const savedBookings = await fetchPassengerBookings(token);
        if (!active) return;
        setBookings(savedBookings);
        localStorage.setItem("userBookings", JSON.stringify(savedBookings));
      } catch (error) {
        console.error("Failed to restore passenger bookings:", error);
      }
    };
    syncBookings();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
      setPendingPayment(getPendingPayment());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    if (upcomingBookings.length === 0) return;

    const calculateTimer = () => {
      const bookingDate = upcomingBookings[0].departureAt;
      if (!bookingDate) return;
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
  }, [upcomingBookings]);

  // Keep upcoming confirmed and processing trips together in departure order.
  useEffect(() => {
    const trips = bookings
      .filter((booking) => isConfirmedBooking(booking) || isProcessingBooking(booking))
      .map((booking) => {
        const route = routes.find((item) => item.routeId === booking.routeId);
        return {
          ...booking,
          route,
          departureAt: getDepartureDate(booking, route),
          displayStatus: isProcessingBooking(booking) ? "processing" : "confirmed",
        };
      });

    if (pendingPayment && !bookings.some((booking) => booking.bookingId === pendingPayment.bookingId)) {
      const route = routes.find((item) => item.routeId === pendingPayment.routeId);
      trips.push({
        ...pendingPayment,
        route,
        departureAt: getDepartureDate(pendingPayment, route),
        displayStatus: "processing",
      });
    }

    const upcoming = trips
      .filter((booking) => booking.departureAt && booking.departureAt > currentTime)
      .sort((first, second) => first.departureAt - second.departureAt);

    // This effect synchronizes the trip summaries with bookings, routes, and current time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUpcomingBookings(upcoming);
  }, [bookings, pendingPayment, routes, currentTime]);

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
      setPendingPayment(getPendingPayment());
    };

    window.addEventListener("storage", syncBookings);
    return () => window.removeEventListener("storage", syncBookings);
  }, []);

  const getBookingDetailsPath = (booking) => {
    const bookingId = booking.bookingId || booking.paymentId;
    const params = new URLSearchParams({ status: booking.displayStatus, bookingId });
    return `/passenger-dashboard/my-bookings?${params.toString()}`;
  };

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
            {upcomingBookings.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-blue-200 bg-card px-4 py-3 shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  Next departure in <span className="font-semibold text-emerald-700 dark:text-emerald-400">{countdown || "Calculating..."}</span>
                </p>
              </div>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link to="/passenger-dashboard/my-bookings?status=confirmed" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <Card className="h-full cursor-pointer bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">UPCOMING TRIPS</p>
                    <p className="text-5xl font-bold mt-3 animate-count">{String(upcomingBookingCount).padStart(2, "0")}</p>
                  </div>
                  <Calendar className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* ── TOTAL BOOKINGS: now reads live from bookings state ── */}
          <Link to="/passenger-dashboard/my-bookings" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Card className="h-full cursor-pointer bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">TOTAL BOOKINGS</p>
                    <p className="text-5xl font-bold mt-3 animate-count">
                      {String(totalBookingCount).padStart(2, "0")}
                    </p>
                  </div>
                  <Ticket className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>

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

        {/* Upcoming Trip Summaries */}
        <Card className="mb-10 border-0 shadow-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Clock className="h-7 w-7 text-blue-600" />
              Your Next Journey
            </CardTitle>
            <CardDescription>Confirmed and processing bookings, ordered by departure time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-8">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const isProcessing = booking.displayStatus === "processing";
                  const startStop = booking.startStop || booking.route?.startStop || "Starting point";
                  const endStop = booking.endStop || booking.route?.endStop || "Destination";
                  return (
                    <Link
                      to={getBookingDetailsPath(booking)}
                      key={booking.bookingId || booking.paymentId}
                      className="flex w-full flex-col gap-4 rounded-lg border border-blue-200 bg-card p-5 text-left text-foreground no-underline transition hover:border-blue-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {booking.date || booking.route?.date || "Date unavailable"} · {booking.departureTime || booking.route?.startTime || "Time unavailable"}
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-foreground">
                          {startStop} <span className="text-blue-500">→</span> {endStop}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Bus {booking.busNo || booking.busId || "—"} · Seat {booking.seat || "—"}
                        </p>
                      </div>
                      <Badge className={isProcessing
                        ? "w-fit bg-amber-500 text-white hover:bg-amber-500"
                        : "w-fit bg-emerald-600 text-white hover:bg-emerald-600"}
                      >
                        {isProcessing ? "PROCESSING" : "CONFIRMED"}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">No upcoming bookings</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-blue-200 pt-5">
              {upcomingBookings.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Next departure in <span className="font-semibold text-emerald-700 dark:text-emerald-400">{countdown || "Calculating..."}</span>
                </p>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/passenger-dashboard/search-buses")}
              >
                Search & Book a Bus
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Most recent expired bookings</CardDescription>
            </div>
            {expiredBookings.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/passenger-dashboard/my-bookings?status=expired")}
              >
                View all ({expiredBookings.length})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {expiredBookings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No expired bookings yet.</p>
            ) : (
              <div className="divide-y">
                {recentExpiredBookings.map((booking) => (
                  <Link
                    key={booking.bookingId}
                    to={getBookingDetailsPath(booking)}
                    className="flex w-full flex-col gap-3 py-5 text-left text-foreground no-underline transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                        <Bus className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {booking.startStop || booking.route?.startStop || "Starting point"} → {booking.endStop || booking.route?.endStop || "Destination"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bus {booking.busNo || booking.busId || "—"} · Seat {booking.seat || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:pl-4">
                      <p className="text-sm text-muted-foreground">
                        {booking.departureAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <Badge className="bg-rose-600 text-white hover:bg-rose-600">Expired</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}