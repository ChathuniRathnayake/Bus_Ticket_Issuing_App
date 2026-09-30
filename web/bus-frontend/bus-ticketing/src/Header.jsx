// src/components/Header.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Users, Map, ShieldCheck, Ticket, Search, Home as HomeIcon, Menu, X } from "lucide-react";
import logo from "./assets/logo.png";

// Pages where a logged-OUT visitor should see ONLY a "Home" link
// (no About / Contact clutter — they're here to log in, not browse).
const LOGIN_OR_REGISTER_PATHS = ["/passenger-login", "/admin-login", "/register"];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // 🎫 Read the "wristband" we gave the user at login time.
  // This works no matter which page they're currently on —
  // including the Home page, where the old URL-guessing logic broke.
  const storedRole = localStorage.getItem("userRole"); // "passenger" | "admin" | null

  // Fallback for anyone who was already logged in before this fix
  // shipped (so their session doesn't suddenly look "broken").
  const isAdminPath = location.pathname.startsWith("/admin");
  const isPassengerPath = location.pathname.startsWith("/passenger");
  const role = storedRole || (isAdminPath ? "admin" : isPassengerPath ? "passenger" : null);

  const isLoginOrRegisterPage = LOGIN_OR_REGISTER_PATHS.includes(location.pathname);
  const navLinkClass = (active = false) => `relative text-white transition-colors after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:bg-cyan-200 after:transition-all after:content-[''] ${active ? "after:w-full" : "after:w-0 hover:after:w-full hover:text-blue-100"}`;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/passenger-login");
  };

  // 🏠 Where should clicking the logo take us?
  const handleLogoClick = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    navigate(role === "admin" ? "/admin-dashboard" : "/passenger-dashboard");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-zinc-800 dark:to-zinc-900 border-b border-blue-700 dark:border-zinc-700 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        {/* Logo */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="TicketGo Logo"
            className="h-11 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">

          {/* ── LOGGED OUT + on Login/Register page → show ONLY "Home" ── */}
          {!isLoggedIn && isLoginOrRegisterPage && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
              <button
                onClick={() => navigate("/")}
                aria-current={location.pathname === "/" ? "page" : undefined}
                className={`flex items-center gap-1 ${navLinkClass(location.pathname === "/")}`}
              >
                <HomeIcon className="h-4 w-4" /> Home
              </button>
            </div>
          )}

          {/* ── LOGGED OUT + everywhere else (i.e. the Home page itself) ── */}
          {!isLoggedIn && !isLoginOrRegisterPage && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
              <button
                onClick={() => navigate("/")}
                aria-current={location.pathname === "/" ? "page" : undefined}
                className={navLinkClass(location.pathname === "/" && !location.hash)}
              >
                Home
              </button>
              <a href="/#about" aria-current={location.hash === "#about" ? "location" : undefined} className={navLinkClass(location.hash === "#about")}>
                About
              </a>
              <a href="/#contact" aria-current={location.hash === "#contact" ? "location" : undefined} className={navLinkClass(location.hash === "#contact")}>
                Contact
              </a>
            </div>
          )}

          {/* ── LOGGED IN → always show Home, plus role-specific links ── */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
              <button
                onClick={() => navigate("/")}
                aria-current={location.pathname === "/" ? "page" : undefined}
                className={`flex items-center gap-1 ${navLinkClass(location.pathname === "/")}`}
              >
                <HomeIcon className="h-4 w-4" /> Home
              </button>

              {role === "passenger" && (
                <>
                  <button
                    onClick={() => navigate("/passenger-dashboard/search-buses")}
                    aria-current={location.pathname.includes("search-buses") ? "page" : undefined}
                    className={navLinkClass(location.pathname.includes("search-buses"))}
                  >
                    Search Buses
                  </button>
                  <button
                    onClick={() => navigate("/passenger-dashboard/my-bookings")}
                    aria-current={location.pathname.includes("my-bookings") ? "page" : undefined}
                    className={navLinkClass(location.pathname.includes("my-bookings"))}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => navigate("/passenger-dashboard/profile")}
                    aria-current={location.pathname.includes("profile") ? "page" : undefined}
                    className={navLinkClass(location.pathname.includes("profile"))}
                  >
                    Profile
                  </button>
                </>
              )}

              {role === "admin" && (
                <>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-buses")}
                    aria-current={location.pathname.includes("manage-buses") ? "page" : undefined}
                    className={`flex items-center gap-1 ${navLinkClass(location.pathname.includes("manage-buses"))}`}
                  >
                    <Bus className="h-4 w-4" /> Buses
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-conductors")}
                    aria-current={location.pathname.includes("manage-conductors") ? "page" : undefined}
                    className={`flex items-center gap-1 ${navLinkClass(location.pathname.includes("manage-conductors"))}`}
                  >
                    <Users className="h-4 w-4" /> Conductors
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-routes")}
                    aria-current={location.pathname.includes("manage-routes") ? "page" : undefined}
                    className={`flex items-center gap-1 ${navLinkClass(location.pathname.includes("manage-routes"))}`}
                  >
                    <Map className="h-4 w-4" /> Routes
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-admins")}
                    aria-current={location.pathname.includes("manage-admins") ? "page" : undefined}
                    className={`flex items-center gap-1 ${navLinkClass(location.pathname.includes("manage-admins"))}`}
                  >
                    <ShieldCheck className="h-4 w-4" /> Admins
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-bookings")}
                    aria-current={location.pathname.includes("manage-bookings") ? "page" : undefined}
                    className={`flex items-center gap-1 ${navLinkClass(location.pathname.includes("manage-bookings"))}`}
                  >
                    <Ticket className="h-4 w-4" /> Bookings
                  </button>
                </>
              )}
            </div>
          )}

          {/* Logout Button */}
          {isLoggedIn && (
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="bg-white text-blue-700 hover:bg-blue-50 font-medium gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}

          {!isLoggedIn && (
            <Button
              onClick={() => navigate("/passenger-login")}
              className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
            >
              Login
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="text-white hover:bg-white/15 hover:text-white md:hidden"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="absolute inset-x-0 top-full z-50 space-y-1 border-t border-white/15 bg-indigo-950/95 p-4 shadow-xl backdrop-blur md:hidden animate-slide-in-left" aria-label="Mobile navigation">
          {!isLoggedIn && isLoginOrRegisterPage && (
            <button onClick={() => { setMobileOpen(false); navigate("/"); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-white hover:bg-white/10"><HomeIcon className="h-4 w-4" />Home</button>
          )}
          {!isLoggedIn && !isLoginOrRegisterPage && (
            <>
              <button onClick={() => { setMobileOpen(false); navigate("/"); }} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-white/10 ${location.pathname === "/" && !location.hash ? "bg-white/10 text-white" : "text-blue-100"}`}><HomeIcon className="h-4 w-4" />Home</button>
              <a href="/#about" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-blue-100 hover:bg-white/10">About</a>
              <a href="/#contact" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-blue-100 hover:bg-white/10">Contact</a>
            </>
          )}
          {isLoggedIn && <button onClick={() => { setMobileOpen(false); navigate("/"); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-blue-100 hover:bg-white/10"><HomeIcon className="h-4 w-4" />Home</button>}
          {isLoggedIn && role === "passenger" && [
            ["Search Buses", "/passenger-dashboard/search-buses"],
            ["My Bookings", "/passenger-dashboard/my-bookings"],
            ["Profile", "/passenger-dashboard/profile"],
          ].map(([label, path]) => <button key={path} onClick={() => { setMobileOpen(false); navigate(path); }} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-blue-100 hover:bg-white/10">{label}</button>)}
          {isLoggedIn && role === "admin" && [
            ["Buses", "/admin-dashboard/manage-buses"],
            ["Conductors", "/admin-dashboard/manage-conductors"],
            ["Routes", "/admin-dashboard/manage-routes"],
            ["Admins", "/admin-dashboard/manage-admins"],
            ["Bookings", "/admin-dashboard/manage-bookings"],
          ].map(([label, path]) => <button key={path} onClick={() => { setMobileOpen(false); navigate(path); }} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-blue-100 hover:bg-white/10">{label}</button>)}
          {isLoggedIn && <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg border-t border-white/15 px-3 pt-2 text-left text-sm text-white"><LogOut className="h-4 w-4" />Logout</button>}
          {!isLoggedIn && <button onClick={() => { setMobileOpen(false); navigate("/passenger-login"); }} className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg border-t border-white/15 px-3 pt-2 text-left text-sm text-white">Login</button>}
        </nav>
      )}
    </header>
  );
}
