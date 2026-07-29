import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Public Pages
import Home from "./Home";

// Route Guard
import ProtectedRoute from "./ProtectedRoute";

// Layout Components
import Header from "./Header";
import Footer from "./Footer";
import PublicFooter from "./PublicFooter";

// Passenger Components
import PassengerLogin from "./Passenger/PassengerLogin";
import Register from "./Passenger/PassengerSignup"; // or PassengerSignup if you named it that
import PassengerDashboard from "./Passenger/PassengerDashboard";
import SearchBuses from "./Passenger/SearchBuses";
import SeatLayout from "./Passenger/SeatLayout";
import Profile from "./Passenger/Profile";
import MyBookings from "./Passenger/MyBookings";
import TicketInfo from "./Passenger/TicketInfo";

// Admin Components
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import AddConductor from "./Admin/AddConductor";
import ManageConductors from "./Admin/ManageConductors";
import AddRoute from "./Admin/AddRoute";
import ManageRoutes from "./Admin/ManageRoutes";
import AddAdmin from "./Admin/AddAdmin";
import ManageAdmins from "./Admin/ManageAdmins";
import AddBus from "./Admin/AddBus";
import ManageBuses from "./Admin/ManageBuses";
import AddSchedule from "./Admin/AddSchedule";
import ManageSchedules from "./Admin/ManageSchedules";

// 🚧 Pages that are "public" — anyone can see them WITHOUT logging in.
// On these pages we show the decorative PublicFooter instead of the
// real Footer (which has links to protected pages).
const PUBLIC_PATHS = ["/", "/passenger-login", "/admin-login", "/register"];

/**
 * This little component's ONLY job is to look at the current URL
 * and decide: "Should I show the Footer here, or not?"
 *
 * It must live INSIDE <Router>, because only components inside
 * <Router> are allowed to use useLocation().
 */
function AppContent({
  conductors,
  setConductors,
  admins,
  setAdmins,
  buses,
  setBuses,
  routes,
  setRoutes,
  schedules,
  setSchedules,
}) {
  const location = useLocation();

  // Is the current page one of our public (not-logged-in) pages?
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 px-6 py-6">
        <Routes>
          {/* Default: public Home page (no login required) */}
          <Route path="/" element={<Home />} />

          {/* Passenger Routes */}
          <Route path="/passenger-login" element={<PassengerLogin />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/passenger-dashboard"
            element={
              <ProtectedRoute requiredRole="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger-dashboard/search-buses"
            element={
              <ProtectedRoute requiredRole="passenger">
                <SearchBuses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger-dashboard/seat-layout"
            element={
              <ProtectedRoute requiredRole="passenger">
                <SeatLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger-dashboard/profile"
            element={
              <ProtectedRoute requiredRole="passenger">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger-dashboard/my-bookings"
            element={
              <ProtectedRoute requiredRole="passenger">
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route path="/ticket" element={<TicketInfo />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Conductors */}
          <Route
            path="/admin-dashboard/add-conductor"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddConductor conductors={conductors} setConductors={setConductors} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/manage-conductors"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageConductors conductors={conductors} setConductors={setConductors} />
              </ProtectedRoute>
            }
          />

          {/* Admins */}
          <Route
            path="/admin-dashboard/add-admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddAdmin admins={admins} setAdmins={setAdmins} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/manage-admins"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageAdmins admins={admins} setAdmins={setAdmins} />
              </ProtectedRoute>
            }
          />

          {/* Buses */}
          <Route
            path="/admin-dashboard/add-bus"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddBus buses={buses} setBuses={setBuses} routes={routes} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/manage-buses"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageBuses buses={buses} setBuses={setBuses} routes={routes} />
              </ProtectedRoute>
            }
          />

          {/* Routes */}
          <Route
            path="/admin-dashboard/add-route"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddRoute routes={routes} setRoutes={setRoutes} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/manage-routes"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageRoutes routes={routes} setRoutes={setRoutes} />
              </ProtectedRoute>
            }
          />

          {/* Schedules */}
          <Route
            path="/admin-dashboard/add-schedule"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddSchedule buses={buses} routes={routes} schedules={schedules} setSchedules={setSchedules} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/manage-schedules"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageSchedules buses={buses} routes={routes} schedules={schedules} setSchedules={setSchedules} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* 👇 Show the pretty "safe" footer on public pages, and the
          real footer (with protected links) everywhere else */}
      {isPublicPage ? <PublicFooter /> : <Footer />}
    </div>
  );
}

export default function App() {
  // State + persistence
  const [conductors, setConductors] = useState([]);
  const [admins, setAdmins] = useState([{ email: "admin@example.com", password: "1234" }]);
  const [buses, setBusesState] = useState([]);
  const [routes, setRoutesState] = useState([]);
  const [schedules, setSchedulesState] = useState([]);

  // Load data from localStorage on app start
  useEffect(() => {
    const storedBuses = localStorage.getItem("buses");
    if (storedBuses) {
      setBusesState(JSON.parse(storedBuses));
    }
    const storedRoutes = localStorage.getItem("routes");
    if (storedRoutes) {
      setRoutesState(JSON.parse(storedRoutes));
    }
    const storedSchedules = localStorage.getItem("schedules");
    if (storedSchedules) {
      setSchedulesState(JSON.parse(storedSchedules));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save functions (auto-save to localStorage)
  const setBuses = (newBuses) => {
    setBusesState(newBuses);
    localStorage.setItem("buses", JSON.stringify(newBuses));
  };

  const setRoutes = (newRoutes) => {
    setRoutesState(newRoutes);
    localStorage.setItem("routes", JSON.stringify(newRoutes));
  };

  const setSchedules = (newSchedules) => {
    setSchedulesState(newSchedules);
    localStorage.setItem("schedules", JSON.stringify(newSchedules));
  };

  return (
    <Router>
      <AppContent
        conductors={conductors}
        setConductors={setConductors}
        admins={admins}
        setAdmins={setAdmins}
        buses={buses}
        setBuses={setBuses}
        routes={routes}
        setRoutes={setRoutes}
        schedules={schedules}
        setSchedules={setSchedules}
      />
    </Router>
  );
}