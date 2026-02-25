import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("✅ Login Successful!");
      navigate("/admin-dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl">Admin Login</CardTitle>
          <CardDescription>Sign in to manage the bus system</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@bus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Fixed: Text is now clearly visible */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-zinc-900 hover:bg-black text-white text-lg cursor-pointer"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}