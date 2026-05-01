// src/components/Header.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Users, Map, ShieldCheck } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  const isAdminPath = location.pathname.includes("/admin");
  const isPassengerPath = location.pathname.includes("/passenger");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/passenger-login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-zinc-800 dark:to-zinc-900 border-b border-blue-700 dark:border-zinc-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(isAdminPath ? "/admin-dashboard" : "/passenger-dashboard")}
        >
          <img 
            src="/src/assets/logo.png" 
            alt="TicketGo Logo" 
            className="h-11 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          
          {/* Passenger Navigation */}
          {token && isPassengerPath && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
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
            </div>
          )}

          {/* Admin Navigation */}
          {token && isAdminPath && (
            <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
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
            </div>
          )}

          {/* Logout Button */}
          {token && (
            <Button 
              onClick={handleLogout}
              variant="secondary"
              className="bg-white text-blue-700 hover:bg-blue-50 font-medium gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}

          {!token && (
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