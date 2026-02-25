import { useState } from "react";

export default function Register({ goLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/api/passenger/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) { alert(data.message); goLogin(); }
    else alert(data.message);
  };

  return (
    <div className="w-96 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Passenger Account</h1>
      <input className="w-full p-2 border mb-3" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full p-2 border mb-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full p-2 bg-green-600 text-white rounded" onClick={handleRegister}>Create Account</button>
      <button className="text-sm text-blue-500 mt-3" onClick={goLogin}>Back to Login</button>
    </div>
  );
}