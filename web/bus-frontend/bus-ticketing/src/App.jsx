import { useState } from "react";                    // ← This was missing!
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import PassengerLogin from "./Passenger/PassengerLogin";
import Register from "./Passenger/PassengerSignup";
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
  const [conductors, setConductors] = useState([]);
  const [admins, setAdmins] = useState([{ email: "admin@example.com", password: "1234" }]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/passenger-login" />} />
          <Route path="/passenger-login" element={<PassengerLogin />} />
          <Route path="/register" element={<Register goLogin={() => {}} />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Conductors */}
          <Route path="/admin-dashboard/add-conductor" element={<AddConductor conductors={conductors} setConductors={setConductors} />} />
          <Route path="/admin-dashboard/manage-conductors" element={<ManageConductors conductors={conductors} setConductors={setConductors} />} />
          
          {/* Admins */}
          <Route path="/admin-dashboard/add-admin" element={<AddAdmin admins={admins} setAdmins={setAdmins} />} />
          <Route path="/admin-dashboard/manage-admins" element={<ManageAdmins admins={admins} setAdmins={setAdmins} />} />
          
          {/* Buses */}
          <Route path="/admin-dashboard/add-bus" element={<AddBus buses={buses} setBuses={setBuses} />} />
          <Route path="/admin-dashboard/manage-buses" element={<ManageBuses buses={buses} setBuses={setBuses} />} />
          
          {/* Routes */}
          <Route path="/admin-dashboard/add-route" element={<AddRoute routes={routes} setRoutes={setRoutes} />} />
          <Route path="/admin-dashboard/manage-routes" element={<ManageRoutes routes={routes} setRoutes={setRoutes} />} />
        </Routes>
      </div>
    </Router>
  );
}