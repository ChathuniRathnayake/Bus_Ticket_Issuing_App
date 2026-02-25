import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase"; // Adjust path if needed

const auth = getAuth(app);

export default function AdminLogin({ goPassenger }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("");

    try {
      // 1️⃣ Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 2️⃣ Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3️⃣ Send token to backend
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Login successful!");
        console.log("Backend response:", data);

        // Save token for later API requests
        localStorage.setItem("adminToken", idToken);
      } else {
        setMessage("❌ " + data.message);
      }

    } catch (error) {
      console.error(error);
      setMessage("❌ Invalid email or password");
    }
  };

  return (
    <div className="w-96 p-6 bg-white rounded shadow m-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border mb-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border mb-3"
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

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}