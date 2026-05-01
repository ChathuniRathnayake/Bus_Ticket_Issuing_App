// src/components/Footer.jsx
import { Bus } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-zinc-800 dark:to-zinc-900 border-t border-blue-700 dark:border-zinc-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Logo + About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/src/assets/logo.png" 
                alt="TicketGo Logo" 
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              TicketGo is a modern real-time bus ticketing platform designed to make 
              travel booking simple, fast, and reliable for passengers across Sri Lanka.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li><a href="/passenger-dashboard/search-buses" className="hover:text-white transition-colors">Search Buses</a></li>
              <li><a href="/passenger-dashboard/my-bookings" className="hover:text-white transition-colors">My Bookings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-blue-100 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">📍</span>
                <div>
                  Colombo 4, Western Province<br />
                  Sri Lanka
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span>📞</span>
                <a href="tel:+94712345678" className="hover:text-white transition-colors">
                  +94 71 234 5678
                </a>
              </div>

              <div className="flex items-center gap-3">
                <span>✉️</span>
                <a href="mailto:info@ticketgo.lk" className="hover:text-white transition-colors">
                  info@ticketgo.lk
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-blue-500 dark:border-zinc-700 mt-10 pt-6 text-center text-blue-100 text-sm">
          © 2026 TicketGo • Real-time Bus Ticketing System<br />
          • All Rights Reserved
        </div>
      </div>
    </footer>
  );
}