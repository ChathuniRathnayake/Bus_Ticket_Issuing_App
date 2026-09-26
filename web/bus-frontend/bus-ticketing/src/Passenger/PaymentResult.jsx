import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, CreditCard, LoaderCircle, Ticket, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAYMENT_API = "http://localhost:5000/api/payments";

function readStoredPayment(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function saveConfirmedBooking(payment) {
  const bookings = readStoredPayment("userBookings") || [];
  if (bookings.some((booking) => booking.bookingId === payment.bookingId)) return;

  const booking = {
    bookingId: payment.bookingId,
    busId: payment.busId,
    busNo: payment.busNo,
    routeId: payment.routeId,
    scheduleId: payment.scheduleId,
    date: payment.date,
    departureTime: payment.departureTime,
    seat: payment.seat,
    bookingDate: new Date().toISOString(),
    status: "Confirmed",
  };
  localStorage.setItem("userBookings", JSON.stringify([booking, ...bookings]));
}

export default function PaymentResult({ cancelled = false }) {
  const navigate = useNavigate();
  const [result, setResult] = useState({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let disposed = false;
    let timer;
    const token = localStorage.getItem("token");
    const payment = readStoredPayment("pendingPayment");

    const update = (nextResult) => {
      if (!disposed) setResult(nextResult);
    };

    if (!token || !payment?.paymentId) {
      if (!cancelled) {
        const lastPayment = readStoredPayment("lastPayment");
        update(lastPayment ? { status: "succeeded", payment: lastPayment } : { status: "missing" });
      } else {
        update({ status: "missing" });
      }
      return () => {
        disposed = true;
      };
    }

    const finishCancellation = async () => {
      try {
        const response = await fetch(`${PAYMENT_API}/${payment.paymentId}/cancel`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok && response.status !== 409) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Could not release the seat reservation");
        }

        if (response.status === 409) {
          const statusResponse = await fetch(`${PAYMENT_API}/${payment.paymentId}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const statusData = await statusResponse.json();
          if (statusData.status !== "CANCELLED") {
            throw new Error(statusData.message || "This payment can no longer be cancelled");
          }
        }

        localStorage.removeItem("pendingPayment");
        update({ status: "cancelled", payment });
      } catch (error) {
        update({ status: "cancel-error", payment, message: error.message });
      }
    };

    const checkPayment = async (attempt = 0) => {
      try {
        const response = await fetch(`${PAYMENT_API}/${payment.paymentId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to verify payment");

        if (data.status === "SUCCEEDED" || data.booking?.status === "CONFIRMED") {
          saveConfirmedBooking(payment);
          localStorage.setItem("lastPayment", JSON.stringify(payment));
          localStorage.removeItem("pendingPayment");
          update({ status: "succeeded", payment });
          return;
        }

        if (["FAILED", "EXPIRED", "CANCELLED"].includes(data.status)) {
          localStorage.removeItem("pendingPayment");
          update({ status: "failed", payment, paymentStatus: data.status });
          return;
        }

        if (attempt >= 20) {
          update({ status: "pending", payment });
          return;
        }

        timer = window.setTimeout(() => checkPayment(attempt + 1), 2500);
      } catch (error) {
        update({ status: "error", payment, message: error.message });
      }
    };

    if (cancelled) finishCancellation();
    else checkPayment();

    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [cancelled, retryCount]);

  const payment = result.payment;
  const isSuccess = result.status === "succeeded";
  const isCancelled = result.status === "cancelled";
  const isFailure = result.status === "failed" || result.status === "cancel-error" || result.status === "error" || result.status === "missing";
  const Icon = isSuccess ? CheckCircle2 : isCancelled ? XCircle : isFailure ? AlertCircle : result.status === "pending" ? Clock3 : LoaderCircle;
  const styles = isSuccess
    ? { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", button: "bg-emerald-700 hover:bg-emerald-800" }
    : isCancelled
      ? { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", button: "" }
      : isFailure
        ? { bar: "bg-rose-500", icon: "bg-rose-50 text-rose-600", button: "" }
        : { bar: "bg-sky-500", icon: "bg-sky-50 text-sky-600", button: "" };

  const heading = {
    loading: "Verifying your payment",
    pending: "Payment is still processing",
    succeeded: "Your ticket is confirmed",
    cancelled: "Checkout was cancelled",
    failed: "Payment was not completed",
    "cancel-error": "Seat release needs attention",
    error: "We could not verify the payment",
    missing: "No payment session found",
  }[result.status];

  const description = {
    loading: "We’re waiting for secure confirmation from the payment provider.",
    pending: "Your payment is taking longer than usual. You can check My Bookings again shortly.",
    succeeded: "Payment received. Your booking is now available in My Bookings.",
    cancelled: "No ticket was issued. The seat reservation has been released.",
    failed: `The payment status is ${result.paymentStatus?.toLowerCase() || "not completed"}. You can select another seat and try again.`,
    "cancel-error": `${result.message || "We could not confirm the seat release."} The reservation will expire automatically if it remains unpaid.`,
    error: result.message || "Try checking My Bookings in a moment.",
    missing: "Start a new booking from Search Buses to create a payment session.",
  }[result.status];

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-4 py-12">
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className={`h-1.5 ${styles.bar}`} />
        <div className="p-7 sm:p-10">
          <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${styles.icon}`}>
            <Icon className={`h-7 w-7 ${result.status === "loading" ? "animate-spin" : ""}`} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Ticket Go · Payment</p>
          <h1 className="text-2xl font-semibold text-slate-950">{heading}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>

          {payment && (
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-slate-200 py-5 text-sm">
              <div>
                <p className="text-xs text-slate-500">ROUTE</p>
                <p className="mt-1 font-medium text-slate-900">
                  {payment.startStop && payment.endStop ? `${payment.startStop} to ${payment.endStop}` : payment.routeId || "Bus trip"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">DATE · DEPARTURE</p>
                <p className="mt-1 font-medium text-slate-900">{payment.date || "—"} · {payment.departureTime || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">BUS · SEAT</p>
                <p className="mt-1 font-medium text-slate-900">{payment.busNo || payment.busId} · {payment.seat}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">BOOKING REFERENCE</p>
                <p className="mt-1 truncate font-mono text-xs text-slate-700">{payment.bookingId || payment.paymentId}</p>
              </div>
            </div>
          )}

          {result.status === "pending" && (
            <Button variant="outline" className="mt-6" onClick={() => setRetryCount((count) => count + 1)}>
              <CreditCard className="mr-2 h-4 w-4" /> Check payment again
            </Button>
          )}

          {result.status === "cancel-error" && (
            <Button variant="outline" className="mt-6" onClick={() => setRetryCount((count) => count + 1)}>
              Try releasing seat again
            </Button>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isSuccess ? (
              <Button className={styles.button} onClick={() => navigate("/passenger-dashboard/my-bookings")}>
                <Ticket className="mr-2 h-4 w-4" /> View my bookings
              </Button>
            ) : (
              <Button onClick={() => navigate("/passenger-dashboard/search-buses")}>
                Search scheduled buses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/passenger-dashboard")}>
              Passenger dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}