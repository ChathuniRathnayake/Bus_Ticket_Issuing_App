import { useState } from "react";

export default function PassengerLogin({ goAdmin, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/passenger/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) alert("Login successful: " + data.token);
    else alert(data.message);
  };

  return (
    <div className="w-96 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Passenger Login</h1>
      <input className="w-full p-2 border mb-3" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full p-2 border mb-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full p-2 bg-blue-600 text-white rounded" onClick={handleLogin}>Login</button>
      <div className="flex justify-between mt-3">
        <button className="text-sm text-blue-500" onClick={goRegister}>Create Account</button>
        <button className="text-sm text-blue-500" onClick={goAdmin}>Admin Login</button>
      </div>
    </div>
  );
}