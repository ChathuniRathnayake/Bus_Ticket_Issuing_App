// src/Home.jsx
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
} from "lucide-react";

// 🎨 Tailwind needs to SEE full class names written out in the code
// (it can't understand `bg-${color}-100` built at runtime), so we
// keep every color combo spelled out here and just pick one by key.
const colorStyles = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-600" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-600" },
};

// 🎬 Small wrapper: fades + slides its children up into view
// the first time they scroll onto the screen.
function Reveal({ children, className = "" }) {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // 🎫 Check the "wristband" from login — is someone already logged in?
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const role = localStorage.getItem("userRole"); // "passenger" | "admin" | null

  const goToDashboard = () => {
    navigate(role === "admin" ? "/admin-dashboard" : "/passenger-dashboard");
  };

  return (
    <div className="animate-fade-in">

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 animate-gradient text-white px-6 py-24 mb-16 shadow-2xl">

        {/* Decorative floating blobs in the background */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 animate-float">
            <Bus className="h-9 w-9" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Travel Sri Lanka, Simply.
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            TicketGo makes booking your next bus journey fast, easy, and
            reliable — search routes, pick your seat, and go.
          </p>

          {isLoggedIn ? (
            // ── Already logged in: no login/signup buttons — just a way back in ──
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                onClick={goToDashboard}
                className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-semibold px-8 h-12 text-base transition-transform duration-200 cursor-pointer gap-2"
              >
                <LayoutDashboard className="h-5 w-5" />
                Go to My Dashboard
              </Button>
              <p className="text-sm text-blue-100">
                Welcome back! You're already logged in.
              </p>
            </div>
          ) : (
            // ── Not logged in: show login / signup options ──
            <>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/passenger-login")}
                  className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-semibold px-8 h-12 text-base transition-transform duration-200 cursor-pointer"
                >
                  Login as Passenger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="border-white text-white hover:bg-white/10 hover:scale-105 font-semibold px-8 h-12 text-base transition-transform duration-200 cursor-pointer"
                >
                  Create an Account
                </Button>
              </div>

              <button
                onClick={() => navigate("/admin-login")}
                className="mt-8 text-sm text-blue-100 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
              >
                Are you an Admin? Login here →
              </button>
            </>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 space-y-24 pb-10">

        {/* ══════════════ ABOUT US ══════════════ */}
        <section id="about" className="scroll-mt-24">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-3">About Us</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              TicketGo is a real-time bus ticketing platform built to remove the
              hassle from travel across Sri Lanka. No more standing in line —
              book your seat from your phone in minutes.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, color: "blue", title: "Wide Route Coverage", desc: "From Colombo to Jaffna, Galle to Trincomalee — find buses across the island." },
              { icon: Ticket, color: "emerald", title: "Real-Time Seats", desc: "See exactly which seats are free right now, and book yours instantly." },
              { icon: ShieldCheck, color: "violet", title: "Safe & Secure", desc: "Your account and bookings are protected with secure, verified logins." },
            ].map((item) => (
              <Reveal key={item.title}>
                <Card className="rounded-2xl h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className={`mx-auto w-14 h-14 ${colorStyles[item.color].bg} ${colorStyles[item.color].text} rounded-2xl flex items-center justify-center mb-4`}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════ HOW TO USE ══════════════ */}
        <section id="how-it-works" className="scroll-mt-24">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-3">How To Use TicketGo</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Booking a ticket only takes four simple steps.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Create an Account", desc: "Sign up with your name, email and password in under a minute." },
              { step: "2", title: "Search Buses", desc: "Choose your starting point, destination and travel date." },
              { step: "3", title: "Pick a Seat", desc: "View the live seat map and choose the seat you want." },
              { step: "4", title: "Get Your Ticket", desc: "Receive a QR-code ticket instantly — show it when boarding." },
            ].map((item) => (
              <Reveal key={item.step} className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════ TERMS & CONDITIONS ══════════════ */}
        <section id="terms" className="scroll-mt-24">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-3">Terms &amp; Conditions</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              A quick summary of the rules for using TicketGo. Please read
              before booking.
            </p>
          </Reveal>

          <Reveal>
            <Card className="rounded-2xl transition-shadow duration-300 hover:shadow-lg">
              <CardContent className="p-8 space-y-5 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">1. Booking &amp; Payment</h3>
                  <p>Seats are reserved only after a booking is confirmed in the app. Duplicate bookings for the same seat are not allowed.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">2. Cancellations</h3>
                  <p>Passengers may cancel a confirmed booking from the "My Bookings" page. Cancelled seats are released for other passengers.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">3. Account Responsibility</h3>
                  <p>You are responsible for keeping your login details private. TicketGo is not liable for bookings made through a shared or compromised account.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">4. Schedule Changes</h3>
                  <p>Bus schedules may occasionally change due to operational reasons. Passengers will be notified where possible.</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </section>

        {/* ══════════════ CONTACT ══════════════ */}
        <section id="contact" className="scroll-mt-24">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-3">Contact Us</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Have a question? We're happy to help.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: MapPin, color: "blue", title: "Address", content: "Colombo 4, Western Province, Sri Lanka" },
              { icon: Phone, color: "emerald", title: "Phone", content: "+94 71 234 5678", href: "tel:+94712345678" },
              { icon: Mail, color: "violet", title: "Email", content: "info@ticketgo.lk", href: "mailto:info@ticketgo.lk" },
            ].map((item) => (
              <Reveal key={item.title}>
                <Card className="rounded-2xl h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <item.icon className={`mx-auto h-8 w-8 ${colorStyles[item.color].text} mb-3`} />
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                    )}
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