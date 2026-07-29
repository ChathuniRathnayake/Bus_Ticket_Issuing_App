// src/components/Header.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Users, Map, ShieldCheck, Home as HomeIcon } from "lucide-react";

// Pages where a logged-OUT visitor should see ONLY a "Home" link
// (no About / Contact clutter — they're here to log in, not browse).
const LOGIN_OR_REGISTER_PATHS = ["/passenger-login", "/admin-login", "/register"];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleLogoClick}
        >
          <img
            src="/src/assets/logo.png"
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
                className="hover:text-blue-200 transition-colors flex items-center gap-1"
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
                className="hover:text-blue-200 transition-colors"
              >
                Home
              </button>
              <a href="/#about" className="hover:text-blue-200 transition-colors">
                About
              </a>
              <a href="/#contact" className="hover:text-blue-200 transition-colors">
                Contact
              </a>
            </div>
          )}

          {/* ── LOGGED IN → always show Home, plus role-specific links ── */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
              <button
                onClick={() => navigate("/")}
                className="hover:text-blue-200 transition-colors flex items-center gap-1"
              >
                <HomeIcon className="h-4 w-4" /> Home
              </button>

              {role === "passenger" && (
                <>
                  <button
                    onClick={() => navigate("/passenger-dashboard/search-buses")}
                    className="hover:text-blue-200 transition-colors"
                  >
                    Search Buses
                  </button>
                  <button
                    onClick={() => navigate("/passenger-dashboard/my-bookings")}
                    className="hover:text-blue-200 transition-colors"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => navigate("/passenger-dashboard/profile")}
                    className="hover:text-blue-200 transition-colors"
                  >
                    Profile
                  </button>
                </>
              )}

              {role === "admin" && (
                <>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-buses")}
                    className="hover:text-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Bus className="h-4 w-4" /> Buses
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-conductors")}
                    className="hover:text-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" /> Conductors
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-routes")}
                    className="hover:text-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Map className="h-4 w-4" /> Routes
                  </button>
                  <button
                    onClick={() => navigate("/admin-dashboard/manage-admins")}
                    className="hover:text-blue-200 transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admins
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
        </div>
      </div>
    </header>
  );
}