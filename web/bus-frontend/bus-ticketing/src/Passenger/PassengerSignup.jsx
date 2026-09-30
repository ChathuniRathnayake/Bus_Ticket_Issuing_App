import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Eye, EyeOff, LoaderCircle, Route, UserPlus } from "lucide-react";

export default function PassengerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const strength = !form.password ? 0 : Math.min(4,
    Number(form.password.length >= 6) +
    Number(form.password.length >= 8) +
    Number(/[A-Z]/.test(form.password) && /[a-z]/.test(form.password)) +
    Number(/[0-9\W]/.test(form.password))
  );
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/passenger/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("Registration successful! Please login.");
      navigate("/passenger-login");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-6xl items-center justify-center py-6 animate-fade-in">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-blue-800 p-8 text-white md:min-h-[680px] md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Bus className="h-6 w-6" /></span>
            <span className="text-lg font-semibold">TicketGo</span>
          </div>
          <div className="relative py-8">
            <Route className="mb-5 h-8 w-8 text-teal-200" />
            <h1 className="max-w-sm text-3xl font-bold leading-tight md:text-4xl">Make more room for the journey.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-teal-100">Create your passenger account and bring your routes, seats, and tickets together.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-teal-100"><UserPlus className="h-5 w-5" />Your travels, all in one place</div>
          </div>
          <div className="relative hidden text-xs text-teal-200 md:block">A simpler way to travel across Sri Lanka</div>
        </aside>

        <section className="flex items-center justify-center px-6 py-9 sm:px-10 md:px-14">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Passenger portal</p>
              <h2 className="text-3xl font-bold">Create your account</h2>
              <p className="mt-2 text-sm text-muted-foreground">Sign up to start booking bus tickets.</p>
            </div>

            {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your.email@example.com" className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Create a password" className="h-11 pr-12" required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="space-y-1.5" aria-live="polite">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Password strength</span><span>{strengthLabel}</span></div>
                  <div className="grid grid-cols-4 gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength}>
                    {[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 rounded-full transition-colors ${strength >= level ? (strength < 2 ? "bg-red-500" : strength < 3 ? "bg-amber-500" : "bg-emerald-500") : "bg-muted"}`} />)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="h-11" required />
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-emerald-700 font-medium text-white hover:bg-emerald-800">
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" onClick={() => navigate("/passenger-login")} className="h-auto p-0 text-blue-600">Login here</Button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}