import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, LoaderCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", token);

      // 🎫 Remember the role, so the Header knows who you are
      // no matter which page you're on (including Home).
      localStorage.setItem("userRole", "admin");

      alert("Login Successful!");
      navigate("/admin-dashboard");

    } catch (error) {
      console.error(error);
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-6xl items-center justify-center py-6 animate-fade-in">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[0.9fr_1.1fr]">

        {/* ── Left branding panel ── */}
        <aside className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-gradient-to-br from-zinc-900 via-slate-800 to-zinc-900 p-8 text-white md:min-h-[560px] md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "24px 24px" }} />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Shield className="h-6 w-6" />
            </span>
            <span className="text-lg font-semibold">TicketGo Admin</span>
          </div>

          <div className="relative py-8">
            <Shield className="mb-5 h-8 w-8 text-zinc-300" />
            <h1 className="max-w-sm text-3xl font-bold leading-tight md:text-4xl">
              Admin Control Centre
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
              Secure access to manage buses, routes, conductors, schedules, and passenger bookings.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-zinc-400">
              <Shield className="h-5 w-5" /> Authorised personnel only
            </div>
          </div>

          <div className="relative hidden items-center gap-2 text-xs text-zinc-500 md:flex">
            <span className="h-px w-10 bg-zinc-600" /> TicketGo Bus Ticketing System
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-14">
          <div className="w-full max-w-md">
            <CardHeader className="px-0 pb-7 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Admin portal</p>
              <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
              <CardDescription className="mt-2">Secure access to manage the bus ticketing system.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-0">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 transition-all focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-12 transition-all focus:ring-2 focus:ring-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white text-base font-semibold transition-colors cursor-pointer gap-2"
              >
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? "Logging in..." : "Login to Dashboard"}
              </Button>

              <p className="pt-2 text-center text-sm text-muted-foreground">
                Not an admin?{" "}
                <Button variant="link" onClick={() => navigate("/passenger-login")} className="h-auto p-0 text-blue-600">
                  Passenger Login
                </Button>
              </p>
            </CardContent>
          </div>
        </section>
      </div>
    </div>
  );
}