import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Passenger Components
import PassengerLogin from "./Passenger/PassengerLogin";
import Register from "./Passenger/PassengerSignup"; // or PassengerSignup if you named it that
import PassengerDashboard from "./Passenger/PassengerDashboard";
import SearchBuses from "./Passenger/SearchBuses";
import SeatLayout from "./Passenger/SeatLayout";
import Profile from "./Passenger/Profile";

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

export default function App() {
  // State + persistence
  const [conductors, setConductors] = useState([]);
  const [admins, setAdmins] = useState([{ email: "admin@example.com", password: "1234" }]);
  const [buses, setBusesState] = useState([]);
  const [routes, setRoutesState] = useState([]);

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

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 p-6">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/passenger-login" />} />

          {/* Passenger Routes */}
          <Route path="/passenger-login" element={<PassengerLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
          <Route 
            path="/passenger-dashboard/search-buses" 
            element={<SearchBuses buses={buses} routes={routes} />} 
          />
          <Route 
            path="/passenger-dashboard/seat-layout" 
            element={<SeatLayout />} 
          />
          <Route 
            path="/passenger-dashboard/profile" 
            element={<Profile />} 
          />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Conductors */}
          <Route 
            path="/admin-dashboard/add-conductor" 
            element={<AddConductor conductors={conductors} setConductors={setConductors} />} 
          />
          <Route 
            path="/admin-dashboard/manage-conductors" 
            element={<ManageConductors conductors={conductors} setConductors={setConductors} />} 
          />

          {/* Admins */}
          <Route 
            path="/admin-dashboard/add-admin" 
            element={<AddAdmin admins={admins} setAdmins={setAdmins} />} 
          />
          <Route 
            path="/admin-dashboard/manage-admins" 
            element={<ManageAdmins admins={admins} setAdmins={setAdmins} />} 
          />

          {/* Buses */}
          <Route 
            path="/admin-dashboard/add-bus" 
            element={<AddBus buses={buses} setBuses={setBuses} routes={routes} />} 
          />
          <Route 
            path="/admin-dashboard/manage-buses" 
            element={<ManageBuses buses={buses} setBuses={setBuses} routes={routes} />} 
          />

          {/* Routes */}
          <Route 
            path="/admin-dashboard/add-route" 
            element={<AddRoute routes={routes} setRoutes={setRoutes} />} 
          />
          <Route 
            path="/admin-dashboard/manage-routes" 
            element={<ManageRoutes routes={routes} setRoutes={setRoutes} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}