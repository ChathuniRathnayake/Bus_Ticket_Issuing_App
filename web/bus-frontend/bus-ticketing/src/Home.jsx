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
  const [openTerm, setOpenTerm] = useState(0);
  const [copiedContact, setCopiedContact] = useState("");

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
      <section className="relative mb-16 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 px-6 py-16 text-white animate-gradient md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-blue-100">
            <Bus className="h-4 w-4" /> Sri Lanka, within reach
          </div>
          <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Travel Sri Lanka, Simply.
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-7 text-blue-100">
            TicketGo makes booking your next bus journey fast, easy, and
            reliable — search routes, pick your seat, and go.
          </p>

          {isLoggedIn ? (
            // ── Already logged in: no login/signup buttons — just a way back in ──
            <div className="flex flex-col items-start gap-3">
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
              <div className="flex flex-col items-start gap-4 sm:flex-row">
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

          <div className="relative mx-auto flex aspect-[1.12/1] w-full max-w-md items-center justify-center" aria-hidden="true">
            <div className="absolute inset-x-8 bottom-7 h-24 rounded-[50%] border-t-2 border-dashed border-white/45" />
            <div className="absolute left-[16%] top-[18%] h-3 w-3 rounded-full bg-cyan-200 animate-soft-pulse" />
            <div className="absolute right-[12%] top-[34%] h-2 w-2 rounded-full bg-white animate-soft-pulse" style={{ animationDelay: "0.8s" }} />
            <div className="absolute bottom-[20%] left-[23%] h-2 w-2 rounded-full bg-emerald-200 animate-soft-pulse" style={{ animationDelay: "1.2s" }} />
            <div className="relative flex h-48 w-64 items-center justify-center rounded-3xl border border-white/35 bg-white/10 shadow-2xl backdrop-blur-sm sm:h-56 sm:w-72">
              <Bus className="h-36 w-36 stroke-[1.15] text-white drop-shadow-lg sm:h-44 sm:w-44" />
              <span className="absolute -bottom-3 left-10 h-7 w-7 rounded-full border-4 border-indigo-700 bg-cyan-200" />
              <span className="absolute -bottom-3 right-10 h-7 w-7 rounded-full border-4 border-indigo-700 bg-cyan-200" />
              <span className="absolute -right-8 top-8 rounded-full border border-white/30 bg-indigo-950/35 px-3 py-2 text-xs text-blue-100">Your seat awaits</span>
            </div>
          </div>
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
                <Card className="group h-full rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
                  <CardContent className="p-8 text-center">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colorStyles[item.color].bg} ${colorStyles[item.color].text} transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110`}>
                      <item.icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
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
              <Reveal key={item.step} className="group relative text-center md:after:absolute md:after:left-[calc(50%+2.5rem)] md:after:top-6 md:after:h-px md:after:w-[calc(100%-5rem)] md:after:bg-gradient-to-r md:after:from-blue-500 md:after:to-emerald-400 md:last:after:hidden">
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white shadow-lg ring-4 ring-background transition-transform duration-300 group-hover:scale-110">
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
            <Card className="rounded-xl">
              <CardContent className="divide-y p-2 text-sm text-muted-foreground sm:p-3">
                {[
                  { title: "Booking & Payment", text: "Seats are reserved only after a booking is confirmed in the app. Duplicate bookings for the same seat are not allowed." },
                  { title: "Cancellations", text: 'Passengers may cancel a confirmed booking from the "My Bookings" page. Cancelled seats are released for other passengers.' },
                  { title: "Account Responsibility", text: "You are responsible for keeping your login details private. TicketGo is not liable for bookings made through a shared or compromised account." },
                  { title: "Schedule Changes", text: "Bus schedules may occasionally change due to operational reasons. Passengers will be notified where possible." },
                ].map((term, index) => (
                  <div key={term.title}>
                    <button type="button" aria-expanded={openTerm === index} onClick={() => setOpenTerm(openTerm === index ? -1 : index)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left font-semibold text-foreground hover:text-blue-700">
                      <span><span className="mr-3 text-blue-600">0{index + 1}</span>{term.title}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openTerm === index ? "rotate-180" : ""}`} />
                    </button>
                    {openTerm === index && <p className="px-4 pb-5 pl-12 leading-6">{term.text}</p>}
                  </div>
                ))}
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
              { icon: MapPin, color: "blue", title: "Address", content: "Colombo 4, Western Province, Sri Lanka", copy: "Colombo 4, Western Province, Sri Lanka" },
              { icon: Phone, color: "emerald", title: "Phone", content: "+94 71 234 5678", href: "tel:+94712345678" },
              { icon: Mail, color: "violet", title: "Email", content: "info@ticketgo.lk", href: "mailto:info@ticketgo.lk" },
            ].map((item) => (
              <Reveal key={item.title}>
                <Card className="group h-full rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-8 text-center">
                    <item.icon className={`mx-auto mb-3 h-8 w-8 ${colorStyles[item.color].text} ${item.title === "Address" ? "animate-float" : "transition-transform duration-300 group-hover:scale-110"}`} />
                    <h3 className="font-semibold mb-1">{item.title}</h3>
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
                      className="mx-auto mt-4 inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
                    >
                      {copiedContact === item.title ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedContact === item.title ? "Copied" : "Copy"}
                    </button>
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