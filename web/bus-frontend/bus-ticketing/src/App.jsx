import { useState } from "react";
import PassengerLogin from "./Passenger/PassengerLogin";
import AdminLogin from "./Admin/AdminLogin";
import Register from "./Passenger/PassengerSignup";

export default function App() {
  const [page, setPage] = useState("passengerLogin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {page === "passengerLogin" && <PassengerLogin goAdmin={() => setPage("adminLogin")} goRegister={() => setPage("register")} />}
      {page === "adminLogin" && <AdminLogin goPassenger={() => setPage("passengerLogin")} />}
      {page === "register" && <Register goLogin={() => setPage("passengerLogin")} />}
    </div>
  );
}