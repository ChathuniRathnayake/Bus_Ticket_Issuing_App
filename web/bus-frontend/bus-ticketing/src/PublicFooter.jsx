// src/components/PublicFooter.jsx
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-zinc-800 dark:to-zinc-900 border-t border-blue-700 dark:border-zinc-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1: Logo + About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/src/assets/logo.png"
                alt="TicketGo Logo"
                className="h-11 w-auto object-contain drop-shadow"
              />
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              TicketGo is a modern real-time bus ticketing platform designed to make
              travel booking simple, fast, and reliable for passengers across Sri Lanka.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3" aria-label="Social channels">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-blue-100 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: About / Public info only — NO protected links here */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-blue-100 text-sm">
              {[
                { href: "/#about", label: "About Us" },
                { href: "/#how-it-works", label: "How To Use" },
                { href: "/#terms", label: "Terms & Conditions" },
                { href: "/#contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="flex items-center gap-2 transition-colors hover:text-white group">
                    <span className="h-px w-4 bg-blue-300/50 group-hover:w-6 transition-all" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-4 text-blue-100 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-cyan-300" />
                <div>
                  Colombo 4, Western Province<br />
                  Sri Lanka
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-cyan-300" />
                <a href="tel:+94712345678" className="hover:text-white transition-colors">
                  +94 71 234 5678
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-cyan-300" />
                <a href="mailto:info@ticketgo.lk" className="hover:text-white transition-colors">
                  info@ticketgo.lk
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200">
          <span>© 2026 TicketGo. All Rights Reserved.</span>
          <span className="hidden sm:block h-px flex-1 bg-white/10 mx-4" />
          <span>Real-time Bus Ticketing System · Sri Lanka</span>
        </div>
      </div>
    </footer>
  );
}