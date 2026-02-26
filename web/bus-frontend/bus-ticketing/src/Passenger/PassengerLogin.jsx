import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus } from "lucide-react";

export default function PassengerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/passenger/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Store token for protected routes
      localStorage.setItem("token", data.token);

      // ✅ Store passenger profile (optional but used in dashboard)
      localStorage.setItem(
        "passengerProfile",
        JSON.stringify(data.passenger)
      );

      alert("Login successful!");

      // ✅ Redirect to dashboard
      navigate("/passenger-dashboard");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
            <Bus className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl">
            Passenger Login
          </CardTitle>
          <CardDescription>
            Book your bus tickets easily
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Links */}
          <div className="flex justify-between pt-2">
            <Button
              variant="link"
              onClick={() => navigate("/admin-login")}
              className="cursor-pointer"
            >
              Admin Login →
            </Button>

            <Button
              variant="link"
              onClick={() => navigate("/register")}
              className="cursor-pointer"
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}