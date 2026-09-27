import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Eye, EyeOff, LoaderCircle, Route, TicketCheck } from "lucide-react";

export default function PassengerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Firebase Authentication (NOT backend)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // 🔑 Get Firebase ID token
      const token = await user.getIdToken();

      // Store token
      localStorage.setItem("token", token);

      // 🎫 Remember the role, so the Header knows who you are
      // no matter which page you're on (including Home).
      localStorage.setItem("userRole", "passenger");

      // Optional user info
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      );

      navigate("/passenger-dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-6xl items-center justify-center py-6 animate-fade-in">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-8 text-white md:min-h-[620px] md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Bus className="h-6 w-6" /></span>
            <span className="text-lg font-semibold">TicketGo</span>
          </div>
          <div className="relative py-8">
            <Route className="mb-5 h-8 w-8 text-cyan-200" />
            <h1 className="max-w-sm text-3xl font-bold leading-tight md:text-4xl">Your next journey starts here.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">Sign in to find your route, choose your seat, and keep every ticket close at hand.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-blue-100"><TicketCheck className="h-5 w-5" />Simple booking, smoother travel</div>
          </div>
          <div className="relative hidden items-center gap-2 text-xs text-blue-200 md:flex"><span className="h-px w-10 bg-blue-300/70" /> Colombo · Galle · Kandy · Jaffna</div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-14">
          <div className="w-full max-w-md">
            <CardHeader className="px-0 pb-7 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Passenger portal</p>
              <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
              <CardDescription className="mt-2">Sign in to manage your trips and tickets.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-0">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-blue-600 text-base text-white hover:bg-blue-700"
          >
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Links */}
          <div className="flex flex-wrap justify-between gap-x-3 pt-2">
            <Button variant="link" onClick={() => navigate("/admin-login")}>
              Admin Login →
            </Button>

            <Button variant="link" onClick={() => navigate("/register")}>
              Create Account
            </Button>
          </div>
        </CardContent>
          </div>
        </section>
      </div>
    </div>
  );
}