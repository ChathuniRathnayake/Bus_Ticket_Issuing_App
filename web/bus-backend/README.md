# Bus Ticket Backend

## Stripe Test Mode

Copy `.env.example` to `.env` and set Stripe **Test Mode** values:

- `STRIPE_SECRET_KEY`: `sk_test_...` from Stripe Developers > API keys
- `STRIPE_WEBHOOK_SECRET`: `whsec_...` from the webhook endpoint or Stripe CLI
- `TICKET_PRICE_CENTS`: server-side ticket price in the smallest currency unit
- `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL`: frontend return URLs

Never commit `.env`, Stripe keys, or `config/serviceAccountKey.json`. The backend never receives or stores card details; Stripe Checkout handles them.

For local webhook forwarding with the Stripe CLI:

```powershell
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Use the printed `whsec_...` value as `STRIPE_WEBHOOK_SECRET`, then restart the backend.

## Payment API

All payment endpoints except the webhook require a Firebase ID token:

```text
Authorization: Bearer <firebase-id-token>
```

`POST /api/payments/checkout-session` reserves a seat transactionally and accepts:

```json
{
  "scheduleId": "schedule-id",
  "busId": "bus-id",
  "seatNumber": "12",
  "amountCents": 45000
}
```

The amount is validated against `schedules.priceCents`, `amountCents`, or `fareCents`, falling back to `TICKET_PRICE_CENTS`. The response contains `checkoutUrl`, `paymentId`, `bookingId`, and `expiresAt`.

- `GET /api/payments/:paymentId/status` returns payment and booking status.
- `POST /api/payments/:paymentId/cancel` cancels the authenticated user's open payment and releases its seat.
- `GET /api/payments/history` returns the authenticated passenger's payment history.
- `POST /api/payments/webhook` verifies the Stripe signature and processes checkout success, async success, async failure, and expiration events.

The lifecycle is `PENDING_PAYMENT` -> `CONFIRMED` / `PAYMENT_FAILED`. Seats are `PENDING_PAYMENT` until verified payment, then `BOOKED`; failed, cancelled, expired, or failed Checkout creation releases them. Webhook event IDs are stored in `stripeWebhookEvents` so retries are idempotent.
