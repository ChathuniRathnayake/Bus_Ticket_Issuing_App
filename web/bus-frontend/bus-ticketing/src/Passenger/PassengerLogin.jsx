import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus } from "lucide-react";

export default function PassengerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/passenger/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token (custom Firebase token)
      localStorage.setItem("token", data.token);

      // Store passenger profile
      localStorage.setItem("passengerProfile", JSON.stringify(data.passenger));

      alert("Login successful!");
      navigate("/passenger-dashboard");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl border-border overflow-hidden">
        
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-3">
            <Bus className="h-7 w-7" />
          </div>

          <CardTitle className="text-3xl font-bold">
            Passenger Login
          </CardTitle>

          <CardDescription>
            Book your bus tickets easily
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8 pt-4">
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Links */}
          <div className="flex justify-between pt-2">
            <Button
              variant="link"
              onClick={() => navigate("/admin-login")}
            >
              Admin Login →
            </Button>

            <Button
              variant="link"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}