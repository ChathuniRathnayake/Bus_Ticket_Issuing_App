// src/context/AuthContext.jsx (updated with busId in initial routes)
import { createContext, useContext, useState } from 'react';
import { mockBuses } from '../mocks/data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
  });

  const [buses, setBuses] = useState(mockBuses);

  const [routes, setRoutes] = useState([
    { id: 'R1', name: 'Colombo-Kandy', stops: ['Colombo', 'Kegalle', 'Kandy'], startTime: '08:00', endTime: '12:30', busId: 1 }, // Added busId
    { id: 'R2', name: 'Colombo-Galle', stops: ['Colombo', 'Panadura', 'Galle'], startTime: '06:30', endTime: '10:00', busId: 2 }, // Added busId
  ]);

  const [users, setUsers] = useState([
    { id: 'U1', name: 'Ruwan Perera', email: 'conductor1@example.com', phone: '+94771234567', role: 'conductor', assignedBus: 1 },
    { id: 'U2', name: 'Nimali Fernando', email: 'driver1@example.com', phone: '+94776543210', role: 'driver', assignedBus: 2 },
    { id: 'P1', name: 'Sarasi', email: 'sarasi@example.com', role: 'passenger' },
  ]);

  const [tickets, setTickets] = useState([
    { 
      id: 'T1', 
      busId: 1, 
      seat: 5, 
      type: 'conductor', 
      time: '2026-01-20 10:30', 
      passengerName: 'Sarasi', 
      conductorName: 'Ruwan Perera', 
      routeId: 'R1',
      boardingStop: 'Colombo',
      destinationStop: 'Kandy'
    },
    { 
      id: 'T2', 
      busId: 2, 
      seat: 12, 
      type: 'online', 
      time: '2026-01-20 11:15', 
      passengerName: 'Nimali', 
      conductorName: 'Amara', 
      routeId: 'R2',
      boardingStop: 'Colombo',
      destinationStop: 'Galle'
    },
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 'L1', action: 'Issued ticket T1', user: 'Ruwan Perera', time: '2026-01-20 10:35' },
  ]);

  const login = (role) => setUser({ isLoggedIn: true, role });
  const logout = () => setUser({ isLoggedIn: false, role: null });

  const addUser = (newUserData) => {
    // Admin can only add conductors or drivers
    if (newUserData.role !== 'conductor' && newUserData.role !== 'driver') {
      alert('Admin can only add Conductors or Drivers');
      return;
    }

    setUsers((prev) => [
      ...prev,
      {
        id: `U${prev.length + 1}`,
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone || null,
        role: newUserData.role,
        assignedBus: newUserData.assignedBus || null,
      },
    ]);
  };

  // Admin can toggle seat status (but we'll disable it in UI for SeatLayouts)
  const toggleSeatStatus = (busId, seatNumber) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.id !== busId) return bus;
        return {
          ...bus,
          seatLayout: bus.seatLayout.map((seat) =>
            seat.number === seatNumber
              ? { ...seat, status: seat.status === 'available' ? 'booked' : 'available' }
              : seat
          ),
        };
      })
    );
  };

  const bookSeat = (busId, routeId, seat, boardingStop, destinationStop) => {
    const newTicket = {
      id: `T${tickets.length + 1}`,
      busId,
      seat,
      type: 'online',
      time: '2026-01-20 ' + new Date().toLocaleTimeString(),
      passengerName: 'Current Passenger',
      conductorName: null,
      routeId,
      boardingStop,
      destinationStop,
    };
    setTickets((prev) => [...prev, newTicket]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        buses,
        setBuses,
        toggleSeatStatus,
        routes,
        setRoutes,
        users,
        setUsers,
        addUser,
        tickets,
        setTickets,
        activityLogs,
        setActivityLogs,
        bookSeat,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};