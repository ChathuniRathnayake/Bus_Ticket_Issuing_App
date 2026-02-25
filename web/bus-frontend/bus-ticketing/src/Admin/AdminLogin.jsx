import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2️⃣ Get Firebase ID Token
      const token = await userCredential.user.getIdToken();

      // 3️⃣ Send token to backend for admin verification
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: token }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // 4️⃣ Store token locally
      localStorage.setItem("token", token);

      alert("✅ Login Successful!");
      navigate("/admin-dashboard");

    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background/50 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-semibold">Admin Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Secure access to manage the bus ticketing system
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 transition-all focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 transition-all focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-lg transition-colors cursor-pointer"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}