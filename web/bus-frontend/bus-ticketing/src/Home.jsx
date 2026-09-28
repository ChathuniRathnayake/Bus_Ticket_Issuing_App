// src/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import {
  Bus,
  Search,
  Ticket,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  LayoutDashboard,
  ChevronDown,
  Copy,
  Check,
  Star,
  Zap,
  Users,
  ArrowRight,
  Globe,
} from "lucide-react";

// 🎨 Tailwind needs to SEE full class names written out in the code
const colorStyles = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-600",    ring: "ring-blue-200",   gradient: "from-blue-500 to-cyan-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-200", gradient: "from-emerald-500 to-teal-500" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-600",  ring: "ring-violet-200",  gradient: "from-violet-500 to-purple-500" },
};

// 🎬 Fade + slide up on scroll into view
function Reveal({ children, className = "", delay = "" }) {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delay} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ✨ Animated stat pill
function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm">
      <Icon className="h-5 w-5 text-cyan-300 shrink-0" />
      <div>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-blue-200 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [openTerm, setOpenTerm] = useState(0);
  const [copiedContact, setCopiedContact] = useState("");

  // 🎫 Check login state
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const role = localStorage.getItem("userRole"); // "passenger" | "admin" | null

  const goToDashboard = () => {
    navigate(role === "admin" ? "/admin-dashboard" : "/passenger-dashboard");
  };

  return (
    <div className="animate-fade-in">

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 animate-gradient">
        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}
        />
        {/* Blurred orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          {/* Left — copy */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Tag pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm text-blue-100 backdrop-blur-sm">
              <Globe className="h-3.5 w-3.5 text-cyan-300" />
              Sri Lanka&apos;s #1 Bus Booking Platform
            </div>

            <h1 className="mb-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Travel Sri Lanka,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 gradient-text">Simply.</span>
                <span className="absolute inset-x-0 -bottom-1 h-3 rounded-full bg-cyan-400/25 blur-sm" />
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-7 text-blue-100 md:text-xl">
              TicketGo makes booking your next bus journey fast, easy, and reliable — search routes, pick your seat, and go.
            </p>

            {isLoggedIn ? (
              <div className="flex flex-col items-start gap-3">
                <Button
                  size="lg"
                  onClick={goToDashboard}
                  className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-semibold px-8 h-12 text-base transition-all duration-200 cursor-pointer gap-2 shadow-xl shadow-blue-900/30"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to My Dashboard
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <p className="text-sm text-blue-200">
                  ✓ Welcome back! You&apos;re already logged in.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => navigate("/passenger-login")}
                    className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-semibold px-8 h-12 text-base transition-all duration-200 cursor-pointer shadow-xl shadow-blue-900/30 gap-2"
                  >
                    <Ticket className="h-5 w-5" />
                    Login as Passenger
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/register")}
                    className="border-white/50 bg-white/10 text-white hover:bg-white/20 hover:scale-105 font-semibold px-8 h-12 text-base transition-all duration-200 cursor-pointer backdrop-blur-sm"
                  >
                    Create an Account
                  </Button>
                </div>

                <button
                  onClick={() => navigate("/admin-login")}
                  className="mt-8 text-sm text-blue-200 hover:text-white underline underline-offset-4 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Are you an Admin? Login here →
                </button>
              </>
            )}

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-3">
              <StatPill icon={Users} value="10K+" label="Passengers" />
              <StatPill icon={Bus} value="500+" label="Bus Routes" />
              <StatPill icon={Star} value="4.9★" label="Rating" />
            </div>
          </div>

          {/* Right — illustrated card */}
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center" aria-hidden="true">
            {/* Rotating ring */}
            <div className="absolute h-72 w-72 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" style={{ animationDuration: "18s" }} />
            {/* Glow */}
            <div className="absolute h-56 w-56 rounded-full bg-white/5 blur-2xl" />

            {/* Floating dots */}
            <div className="absolute left-[12%] top-[16%] h-3.5 w-3.5 rounded-full bg-cyan-300 animate-soft-pulse shadow-lg shadow-cyan-400/50" />
            <div className="absolute right-[10%] top-[30%] h-2.5 w-2.5 rounded-full bg-white animate-soft-pulse shadow-lg" style={{ animationDelay: "0.8s" }} />
            <div className="absolute bottom-[18%] left-[20%] h-2.5 w-2.5 rounded-full bg-emerald-300 animate-soft-pulse shadow-lg shadow-emerald-400/50" style={{ animationDelay: "1.2s" }} />
            <div className="absolute right-[20%] bottom-[28%] h-2 w-2 rounded-full bg-violet-300 animate-soft-pulse" style={{ animationDelay: "1.8s" }} />

            {/* Main card */}
            <div className="relative flex h-52 w-72 flex-col items-center justify-center rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md sm:h-60 sm:w-80">
              <Bus className="h-32 w-32 stroke-[1.1] text-white drop-shadow-2xl sm:h-40 sm:w-40 animate-float" />
              {/* Wheels */}
              <span className="absolute -bottom-4 left-12 h-8 w-8 rounded-full border-4 border-indigo-700 bg-cyan-200 shadow-lg" />
              <span className="absolute -bottom-4 right-12 h-8 w-8 rounded-full border-4 border-indigo-700 bg-cyan-200 shadow-lg" />
              {/* Floating tags */}
              <span className="absolute -right-10 top-6 rounded-xl border border-white/25 bg-indigo-950/50 px-3 py-1.5 text-xs text-blue-100 backdrop-blur-sm shadow-lg">
                🎫 Your seat awaits
              </span>
              <span className="absolute -left-10 bottom-10 rounded-xl border border-white/25 bg-indigo-950/50 px-3 py-1.5 text-xs text-blue-100 backdrop-blur-sm shadow-lg">
                ⚡ Instant booking
              </span>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="white" className="dark:fill-zinc-950" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-28 pb-16 dark:bg-zinc-950">

        {/* ══════════════ FEATURES / ABOUT ══════════════ */}
        <section id="about" className="scroll-mt-24 pt-8">
          <Reveal>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-4">
                <Zap className="h-3.5 w-3.5" /> Why TicketGo?
              </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-3 md:text-4xl">Built for Sri Lankan Travelers</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-lg">
              TicketGo is a real-time bus ticketing platform built to remove the hassle from travel across Sri Lanka. No more standing in line — book your seat from your phone in minutes.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, color: "blue", title: "Wide Route Coverage", desc: "From Colombo to Jaffna, Galle to Trincomalee — find buses across the entire island.", stat: "500+ routes" },
              { icon: Ticket, color: "emerald", title: "Real-Time Seats", desc: "See exactly which seats are free right now, and book yours instantly with live updates.", stat: "Live availability" },
              { icon: ShieldCheck, color: "violet", title: "Safe & Secure", desc: "Your account and bookings are protected with secure, verified logins and encrypted data.", stat: "100% secure" },
            ].map((item) => (
              <Reveal key={item.title}>
                <Card className="group h-full rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-950/10 border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    {/* Top accent bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colorStyles[item.color].gradient}`} />
                    <div className="p-8 text-center">
                      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${colorStyles[item.color].bg} ${colorStyles[item.color].text} ring-4 ${colorStyles[item.color].ring} ring-opacity-30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${colorStyles[item.color].bg} ${colorStyles[item.color].text}`}>
                        <Check className="h-3 w-3" /> {item.stat}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section id="how-it-works" className="scroll-mt-24">
          <Reveal>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-4">
                <ArrowRight className="h-3.5 w-3.5" /> How It Works
              </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-3 md:text-4xl">Book in 4 Simple Steps</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14 text-lg">
              From sign-up to boarding, the whole experience takes only a few minutes.
            </p>
          </Reveal>

          {/* Steps with connecting line */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", icon: Users, title: "Create an Account", desc: "Sign up with your name, email and password in under a minute.", color: "blue" },
                { step: "02", icon: Search, title: "Search Buses", desc: "Choose your starting point, destination and travel date.", color: "indigo" },
                { step: "03", icon: Bus, title: "Pick a Seat", desc: "View the live seat map and choose the perfect seat.", color: "violet" },
                { step: "04", icon: Ticket, title: "Get Your Ticket", desc: "Receive a QR-code ticket instantly — show it when boarding.", color: "emerald" },
              ].map((item) => (
                <Reveal key={item.step} className="relative">
                  <div className="group text-center">
                    {/* Step number circle */}
                    <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/40">
                      <item.icon className="h-7 w-7" />
                      <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-700 shadow-md ring-2 ring-blue-100">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* CTA below steps */}
          <Reveal className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => navigate(isLoggedIn ? "/passenger-dashboard/search-buses" : "/register")}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-10 h-12 rounded-xl shadow-xl shadow-blue-500/25 hover:scale-105 transition-all duration-200 gap-2"
            >
              {isLoggedIn ? "Search Buses Now" : "Get Started for Free"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Reveal>
        </section>

        {/* ══════════════ TERMS & CONDITIONS ══════════════ */}
        <section id="terms" className="scroll-mt-24">
          <Reveal>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-950 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Terms & Conditions
              </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-3 md:text-4xl">Terms & Conditions</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-lg">
              A quick summary of the rules for using TicketGo. Please read before booking.
            </p>
          </Reveal>

          <Reveal>
            <Card className="rounded-2xl shadow-lg border-0 overflow-hidden max-w-3xl mx-auto">
              {/* Card header accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500" />
              <CardContent className="divide-y p-0">
                {[
                  { title: "Booking & Payment", text: "Seats are reserved only after a booking is confirmed in the app. Duplicate bookings for the same seat are not allowed." },
                  { title: "Cancellations", text: 'Passengers may cancel a confirmed booking from the "My Bookings" page. Cancelled seats are released for other passengers.' },
                  { title: "Account Responsibility", text: "You are responsible for keeping your login details private. TicketGo is not liable for bookings made through a shared or compromised account." },
                  { title: "Schedule Changes", text: "Bus schedules may occasionally change due to operational reasons. Passengers will be notified where possible." },
                ].map((term, index) => (
                  <div key={term.title}>
                    <button
                      type="button"
                      aria-expanded={openTerm === index}
                      onClick={() => setOpenTerm(openTerm === index ? -1 : index)}
                      className="flex min-h-16 w-full items-center justify-between gap-4 px-6 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {term.title}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${openTerm === index ? "rotate-180" : ""}`} />
                    </button>
                    {openTerm === index && (
                      <p className="px-6 pb-6 pl-16 leading-7 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-200">
                        {term.text}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </section>

        {/* ══════════════ CONTACT ══════════════ */}
        <section id="contact" className="scroll-mt-24">
          <Reveal>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-4">
                <Phone className="h-3.5 w-3.5" /> Get in Touch
              </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-3 md:text-4xl">Contact Us</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-lg">
              Have a question or need help? We&apos;re happy to assist you.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: MapPin, color: "blue", title: "Address", content: "Colombo 4, Western Province, Sri Lanka", copy: "Colombo 4, Western Province, Sri Lanka" },
              { icon: Phone, color: "emerald", title: "Phone", content: "+94 71 234 5678", href: "tel:+94712345678" },
              { icon: Mail, color: "violet", title: "Email", content: "info@ticketgo.lk", href: "mailto:info@ticketgo.lk" },
            ].map((item) => (
              <Reveal key={item.title}>
                <Card className="group h-full rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colorStyles[item.color].gradient}`} />
                    <div className="p-8 text-center">
                      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${colorStyles[item.color].bg} ${colorStyles[item.color].text} transition-transform duration-300 group-hover:scale-110`}>
                        <item.icon className={`h-7 w-7 ${item.title === "Address" ? "animate-float" : ""}`} />
                      </div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{item.content}</p>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(item.copy || item.content);
                            setCopiedContact(item.title);
                            window.setTimeout(() => setCopiedContact(""), 1600);
                          } catch {
                            setCopiedContact("");
                          }
                        }}
                        aria-label={`Copy ${item.title.toLowerCase()}`}
                        className={`mx-auto mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-all duration-200 ${copiedContact === item.title ? "bg-emerald-100 text-emerald-700" : `${colorStyles[item.color].bg} ${colorStyles[item.color].text} hover:brightness-95`}`}
                      >
                        {copiedContact === item.title ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedContact === item.title ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}