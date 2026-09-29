import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket, Info, CheckCircle2 } from "lucide-react";

export default function TicketInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  const ticketData = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("data");
    if (!raw) return null;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch (error) {
      console.warn("Failed to parse ticket QR data", error);
      return null;
    }
  }, [location.search]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:to-zinc-900 animate-fade-in">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl border border-slate-200 overflow-hidden">

        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <CardHeader className="flex flex-row items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 px-6 py-5 border-b border-slate-200">
          <Button variant="ghost" onClick={() => navigate(-1)} className="h-10 w-10 p-0 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl">Ticket Details</CardTitle>
            <p className="text-sm text-slate-500">Scan result from QR code</p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!ticketData ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 shadow-sm">
                <Info className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Ticket information not found</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                This page expects ticket details encoded in the QR code. Make sure the correct ticket QR was scanned.
              </p>
              <Button onClick={() => navigate("/passenger-dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Ticket ID banner */}
              <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">Ticket ID</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{ticketData.bookingId}</p>
                </div>
                <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-500 shrink-0" />
              </div>

              {/* Key fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Bus Number", value: ticketData.busNo },
                  { label: "Seat", value: ticketData.seat },
                  { label: "Route", value: ticketData.routeId },
                  {
                    label: "Booked At",
                    value: ticketData.bookingDate
                      ? new Date(ticketData.bookingDate).toLocaleString()
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-white dark:bg-zinc-800 dark:border-zinc-700 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Raw payload */}
              <div className="rounded-xl border border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">Raw ticket payload</h3>
                <pre className="whitespace-pre-wrap break-words text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  {JSON.stringify(ticketData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
