import { useState } from "react";

export default function AdminLogin({ goPassenger }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Admin login successful: " + data.token);
        // You can save the token in localStorage or context here
        localStorage.setItem("adminToken", data.token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again.");
    }
  };

  return (
    <div className="w-96 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      <input
        className="w-full p-2 border mb-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-2 border mb-3"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="w-full p-2 bg-red-600 text-white rounded"
        onClick={handleLogin}
      >
        Login
      </button>

      <button
        className="text-sm text-blue-500 mt-3"
        onClick={goPassenger}
      >
        Back to Passenger Login
      </button>
    </div>
  );
}