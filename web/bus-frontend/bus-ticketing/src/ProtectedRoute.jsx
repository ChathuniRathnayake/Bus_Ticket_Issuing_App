// src/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

/**
 * 🛡️ ProtectedRoute — the "bouncer" component.
 *
 * Wrap any page with this, and it will check for a login token
 * BEFORE showing that page. No token? Straight to the login page,
 * no matter what URL someone typed in the address bar.
 *
 * Usage:
 *   <ProtectedRoute requiredRole="passenger">
 *     <PassengerDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Send admins-in-training to the admin login,
    // and everyone else to the passenger login.
    const loginPath = requiredRole === "admin" ? "/admin-login" : "/passenger-login";

    // We also remember WHERE they were trying to go (location),
    // in case we want to send them back there after logging in.
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return children;
}