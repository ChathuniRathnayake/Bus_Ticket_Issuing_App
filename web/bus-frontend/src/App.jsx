import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/dashboard/Login';
import DashboardHome from './pages/dashboard/Home';
import Buses from './pages/dashboard/Buses';
import DashboardLayout from './components/DashboardLayout';
//import PassengersHome from './pages/passengers/Home';
import RoutesPage from './pages/dashboard/Routes';           // new
import SeatLayouts from './pages/dashboard/SeatLayouts';     // new
import TicketsMonitor from './pages/dashboard/TicketsMonitor'; // new
import UsersManagement from './pages/dashboard/UsersManagement'; // new

// Context-based auth (recommended to avoid Recoil + React 19 issues)
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
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="dashboard">
              <DashboardLayout>
                <Routes>
                  <Route path="home" element={<DashboardHome />} />
                  <Route path="buses" element={<Buses />} />
                  <Route path="routes" element={<RoutesPage />} />           {/* new */}
                  <Route path="seats" element={<SeatLayouts />} />           {/* new */}
                  <Route path="tickets" element={<TicketsMonitor />} />      {/* new */}
                  <Route path="users" element={<UsersManagement />} />        {/* new */}
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ... passengers routes ... */}
      </Routes>
    </Router>
  );
}

export default App;