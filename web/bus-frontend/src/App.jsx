// src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Pages
import AdminLogin from './pages/dashboard/Login';
import DashboardHome from './pages/dashboard/Home';
import Buses from './pages/dashboard/Buses';
import DashboardLayout from './components/DashboardLayout';
import RoutesPage from './pages/dashboard/Routes';
import SeatLayouts from './pages/dashboard/SeatLayouts';
import TicketsMonitor from './pages/dashboard/TicketsMonitor';
import UsersManagement from './pages/dashboard/UsersManagement';

import CreateAdmin from './pages/admin/CreateAdmin';
import CreateConductor from './pages/admin/CreateConductor';

// Passenger Pages
import PassengersHome from './pages/passengers/Home';
import SeatBooking from './pages/passengers/Bookings';
import PassengerLogin from './pages/PassengerLogin';
import Signup from './pages/passengers/Signup';

// Role selection page
import RoleSelection from './pages/RoleSelection';

// Context
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user?.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ROLE SELECTION PAGE */}
        <Route path="/" element={<RoleSelection />} />

        {/* ================= ADMIN ================= */}

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/create-admin" element={<CreateAdmin />} />
        <Route path="/admin/create-conductor" element={<CreateConductor />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="dashboard">
              <DashboardLayout>
                <Routes>
                  <Route path="home" element={<DashboardHome />} />
                  <Route path="buses" element={<Buses />} />
                  <Route path="routes" element={<RoutesPage />} />
                  <Route path="seats" element={<SeatLayouts />} />
                  <Route path="tickets" element={<TicketsMonitor />} />
                  <Route path="users" element={<UsersManagement />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= PASSENGER ================= */}

        <Route path="/passenger/login" element={<PassengerLogin />} />
        <Route path="/passenger/signup" element={<Signup />} />

        <Route
          path="/passengers/*"
          element={
            <ProtectedRoute allowedRole="passengers">
              <Routes>
                <Route path="home" element={<PassengersHome />} />
                <Route path="book/:routeId" element={<SeatBooking />} />
              </Routes>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;