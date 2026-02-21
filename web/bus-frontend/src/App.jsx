// src/App.js (corrected import and route for Bookings/SeatBooking)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/dashboard/Login';
import DashboardHome from './pages/dashboard/Home';
import Buses from './pages/dashboard/Buses';
import DashboardLayout from './components/DashboardLayout';
import RoutesPage from './pages/dashboard/Routes';
import SeatLayouts from './pages/dashboard/SeatLayouts';
import TicketsMonitor from './pages/dashboard/TicketsMonitor';
import UsersManagement from './pages/dashboard/UsersManagement';
import PassengersHome from './pages/passengers/Home';
import SeatBooking from './pages/passengers/Bookings'; 

// Context-based auth
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  if (!user.isLoggedIn) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

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