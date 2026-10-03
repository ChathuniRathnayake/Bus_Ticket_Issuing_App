import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { fetchPassengerBookings, getTripTiming, getTripTimingStatus } from "@/utils/bookings";
import {
  Search, Ticket, User, Bus, Calendar, Clock,
  Sun, Moon, ArrowRight, Zap, TrendingUp, ChevronRight, Sparkles
} from "lucide-react";

function isConfirmedBooking(booking) {
  return ["CONFIRMED", "BOOKED"].includes(String(booking.status || "").toUpperCase())
    || String(booking.paymentStatus || "").toUpperCase() === "SUCCEEDED";
}

function isProcessingBooking(booking) {
  return ["PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(String(booking.status || "").toUpperCase());
}

function getDepartureDate(booking, route) {
  return getTripTiming(booking, route).departureAt;
}

function formatCountdown(departureAt, now) {
  const diff = departureAt.getTime() - now.getTime();
  if (diff <= 0) return "Journey started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
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
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [clockTime, setClockTime] = useState(() => new Date());

  const confirmedBookings = bookings.filter(isConfirmedBooking);
  const processingBookings = bookings.filter(isProcessingBooking);
  const totalBookingCount = confirmedBookings.length + processingBookings.length + (
    pendingPayment && !bookings.some((booking) => booking.bookingId === pendingPayment.bookingId) ? 1 : 0
  );
  const upcomingBookingCount = confirmedBookings.filter((booking) => {
    const route = routes.find((item) => item.routeId === booking.routeId);
    return getTripTimingStatus(booking, route, currentTime) === "upcoming";
  }).length;
  const onTheWayBookingCount = confirmedBookings.filter((booking) => {
    const route = routes.find((item) => item.routeId === booking.routeId);
    return getTripTimingStatus(booking, route, currentTime) === "on_the_way";
  }).length;
  const expiredBookings = confirmedBookings
    .map((booking) => {
      const route = routes.find((item) => item.routeId === booking.routeId);
      return {
        ...booking,
        route,
        departureAt: getDepartureDate(booking, route),
        displayStatus: getTripTimingStatus(booking, route, currentTime),
      };
    })
    .filter((booking) => booking.displayStatus === "expired")
    .sort((first, second) => second.departureAt - first.departureAt);
  const recentExpiredBookings = expiredBookings.slice(0, 5);
  const nextDepartureBooking = upcomingBookings.find((booking) => booking.displayStatus === "upcoming");
  const nextDepartureCountdown = nextDepartureBooking
    ? formatCountdown(nextDepartureBooking.departureAt, clockTime)
    : "";

  // Fetch routes from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/route/available", {
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

  useEffect(() => {
    const timer = window.setInterval(() => setClockTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Keep upcoming confirmed and processing trips together in departure order.
  useEffect(() => {
    const trips = bookings
      .filter((booking) => isConfirmedBooking(booking) || isProcessingBooking(booking))
      .map((booking) => {
        const route = routes.find((item) => item.routeId === booking.routeId);
        const { departureAt } = getTripTiming(booking, route);
        return {
          ...booking,
          route,
          departureAt,
          displayStatus: isProcessingBooking(booking)
            ? "processing"
            : getTripTimingStatus(booking, route, currentTime),
        };
      });

    if (pendingPayment && !bookings.some((booking) => booking.bookingId === pendingPayment.bookingId)) {
      const route = routes.find((item) => item.routeId === pendingPayment.routeId);
      const { departureAt } = getTripTiming(pendingPayment, route);
      trips.push({
        ...pendingPayment,
        route,
        departureAt,
        displayStatus: "processing",
      });
    }

    const upcoming = trips
      .filter((booking) => booking.displayStatus === "on_the_way"
        || (booking.departureAt && booking.departureAt > currentTime))
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300`}>

      {/* ── Hero Header Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 dark:from-zinc-800 dark:to-zinc-900 animate-gradient px-6 py-10 md:py-14">
        {/* Dot pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
        {/* Blurred orbs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Greeting */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-200 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              {greeting()}, ready to travel?
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              {profile?.firstName ? (
                <>Welcome back, <span className="text-cyan-300">{profile.firstName}</span>! 👋</>
              ) : (
                <>Welcome back, <span className="text-cyan-300">Traveler</span>! 👋</>
              )}
            </h1>
            <p className="mt-2 text-blue-200 text-base md:text-lg">
              Where are you heading today?
            </p>

            {upcomingBookings.length > 0 && (
              <div className="mt-5 inline-flex items-center gap-4 rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-emerald-400/20 to-cyan-400/15 px-5 py-4 shadow-lg shadow-emerald-950/20 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/20">
                  <Clock className="h-6 w-6 text-emerald-200" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Next departure in
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-emerald-200">{nextDepartureCountdown}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Dark mode toggle */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <Sun className="h-4 w-4 text-yellow-300" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="h-4 w-4 text-blue-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Upcoming Trips */}
          <Link to="/passenger-dashboard/my-bookings?status=active" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <Card className="h-full cursor-pointer border-0 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              <CardContent className="p-7">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Journeys</p>
                    </div>
                    <p className="text-6xl font-black mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent animate-count">
                      {String(upcomingBookingCount + onTheWayBookingCount).padStart(2, "0")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">upcoming and on the way</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  View all bookings <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Total Bookings */}
          <Link to="/passenger-dashboard/my-bookings" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Card className="h-full cursor-pointer border-0 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardContent className="p-7">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Bookings</p>
                    </div>
                    <p className="text-6xl font-black mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent animate-count">
                      {String(totalBookingCount).padStart(2, "0")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">tickets booked in total</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                    <Ticket className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  View ticket history <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Search Buses */}
            <Card
              className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              onClick={() => navigate("/passenger-dashboard/search-buses")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
              <CardContent className="p-7 flex flex-col items-center text-center">
                <div className="w-18 h-18 mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 shadow-md group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                  <Search className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-1.5">Search Buses</h3>
                <p className="text-sm text-muted-foreground mb-5">Find and book your next journey across Sri Lanka</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-200">
                  Search now <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card
              className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              onClick={() => navigate("/passenger-dashboard/my-bookings")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-400" />
              <CardContent className="p-7 flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950 shadow-md group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-violet-500/20">
                  <Ticket className="h-10 w-10 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold mb-1.5">My Bookings</h3>
                <p className="text-sm text-muted-foreground mb-5">View all your tickets and travel history</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 group-hover:gap-3 transition-all duration-200">
                  View tickets <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            {/* My Profile */}
            <Card
              className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              onClick={() => navigate("/passenger-dashboard/profile")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardContent className="p-7 flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 shadow-md group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                  <User className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-1.5">My Profile</h3>
                <p className="text-sm text-muted-foreground mb-5">Manage your account details and preferences</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all duration-200">
                  Manage profile <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Upcoming Trips ── */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/30">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Your Journeys
              </CardTitle>
              <CardDescription className="mt-1">Upcoming and in-progress trips, ordered by departure time.</CardDescription>
            </div>
            {nextDepartureCountdown && (
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-5 py-4 shadow-md dark:border-emerald-900 dark:from-emerald-950 dark:via-zinc-900 dark:to-cyan-950">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Next departure in
                </p>
                <p className="mt-1 font-mono text-2xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">{nextDepartureCountdown}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-5 pb-7 px-6 space-y-4">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const isProcessing = booking.displayStatus === "processing";
                  const isOnTheWay = booking.displayStatus === "on_the_way";
                  const startStop = booking.startStop || booking.route?.startStop || "Starting point";
                  const endStop = booking.endStop || booking.route?.endStop || "Destination";
                  return (
                    <Link
                      to={getBookingDetailsPath(booking)}
                      key={booking.bookingId || booking.paymentId}
                      className="group flex w-full flex-col gap-4 rounded-xl border border-blue-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 text-left text-foreground no-underline transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                          <Bus className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {booking.date || booking.route?.date || "Date unavailable"} · {booking.departureTime || booking.route?.startTime || "Time unavailable"}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-foreground">
                            {startStop} <span className="text-blue-500 mx-1">→</span> {endStop}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Bus {booking.busNo || booking.busId || "—"} · Seat {booking.seat || "—"}
                          </p>
                          {!isOnTheWay && <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm dark:border-blue-900 dark:bg-blue-950/60">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Departure in</p>
                              <p className="font-mono text-base font-extrabold tabular-nums text-blue-900 dark:text-blue-100">
                                {formatCountdown(booking.departureAt, clockTime)}
                              </p>
                            </div>
                          </div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                        <Badge className={isProcessing
                          ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold"
                          : isOnTheWay
                            ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold"}
                        >
                          {isProcessing ? "PROCESSING" : isOnTheWay ? "ON THE WAY" : "UPCOMING"}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950">
                  <Bus className="h-8 w-8 text-blue-400" />
                </div>
                <p className="font-medium text-muted-foreground">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground mt-1">Book your next journey below!</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 gap-2 rounded-xl"
                onClick={() => navigate("/passenger-dashboard/search-buses")}
              >
                <Search className="h-4 w-4" />
                Search & Book a Bus
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Recent Activity ── */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-md shadow-rose-500/30">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="mt-1">Most recent expired bookings from your history</CardDescription>
            </div>
            {expiredBookings.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/passenger-dashboard/my-bookings?status=expired")}
                className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950 gap-1"
              >
                View all ({expiredBookings.length}) <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {expiredBookings.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950">
                  <Ticket className="h-8 w-8 text-rose-400" />
                </div>
                <p className="font-medium text-muted-foreground">No past trips yet</p>
                <p className="text-sm text-muted-foreground mt-1">Your completed journeys will appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentExpiredBookings.map((booking) => (
                  <Link
                    key={booking.bookingId}
                    to={getBookingDetailsPath(booking)}
                    className="group flex w-full flex-col gap-3 py-5 text-left text-foreground no-underline transition-all hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between rounded-xl px-3 -mx-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 shadow-sm">
                        <Bus className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {booking.startStop || booking.route?.startStop || "Starting point"}{" "}
                          <span className="text-muted-foreground mx-1">→</span>{" "}
                          {booking.endStop || booking.route?.endStop || "Destination"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Bus {booking.busNo || booking.busId || "—"} · Seat {booking.seat || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:pl-4">
                      <p className="text-sm text-muted-foreground">
                        {booking.departureAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <Badge className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold">Expired</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
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