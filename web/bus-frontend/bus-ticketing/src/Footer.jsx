export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">Bus Ticket Issuing App</p>
          <p className="text-xs text-slate-400">Built for easy bus booking, seat selection, and conductor management.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>© 2026 Bus Ticket</span>
          <span className="hidden sm:inline">•</span>
          <a href="mailto:support@example.com" className="transition hover:text-white">
            support@example.com
          </a>
          <a href="#top" className="transition hover:text-white">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
