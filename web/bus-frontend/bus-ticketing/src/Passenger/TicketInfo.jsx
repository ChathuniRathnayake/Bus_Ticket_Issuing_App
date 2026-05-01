import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket, Info } from "lucide-react";

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
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-3xl shadow-2xl rounded-3xl border border-slate-200">
        <CardHeader className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-6 py-5">
          <Button variant="ghost" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl">Ticket details</CardTitle>
            <p className="text-sm text-slate-500">Scan result from QR code</p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!ticketData ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Info className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ticket information not found</h3>
              <p className="text-sm text-slate-600 mb-6">
                This page expects ticket details encoded in the QR code. Make sure the correct ticket QR was scanned.
              </p>
              <Button onClick={() => navigate("/passenger-dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ticket ID</p>
                    <p className="text-lg font-semibold text-slate-900">{ticketData.bookingId}</p>
                  </div>
                </div>

                <div className="grid gap-4 mt-6 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Bus number</p>
                    <p className="mt-2 text-lg font-semibold">{ticketData.busNo}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Seat</p>
                    <p className="mt-2 text-lg font-semibold">{ticketData.seat}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Route</p>
                    <p className="mt-2 text-lg font-semibold">{ticketData.routeId}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Booked at</p>
                    <p className="mt-2 text-lg font-semibold">
                      {new Date(ticketData.bookingDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Raw ticket payload</h3>
                <pre className="whitespace-pre-wrap break-words text-sm text-slate-600">
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
