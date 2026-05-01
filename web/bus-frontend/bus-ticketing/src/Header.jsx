import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow">🚌</span>
          <span>Bus Ticket</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link to="/passenger-login" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Passenger login
          </Link>
          <Link to="/register" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Sign up
          </Link>
          <Link to="/admin-login" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Admin
          </Link>
          <Link
            to="/passenger-dashboard"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
