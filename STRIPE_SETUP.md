# Ad-Free Subscription — Setup & Operations

The site sells a **$9.99/year ad-free subscription** via Stripe Checkout.
Subscribers see no ads and no promo links — just the raw game.

## How it works

- "Go Ad-Free" on the main page opens a modal → **Subscribe** redirects to a
  Stripe-hosted Checkout page (coupon codes can be entered there).
- After payment, Stripe redirects back with a session ID. A serverless function
  (`api/verify-session.js`) confirms the subscription with Stripe using your
  secret key and returns a signed token the browser stores in `localStorage`.
- On every page load, an inline script in `public/index.html` checks that token
  and skips loading the ad scripts entirely; the React app also hides all ad
  slots and promo links. Status is re-confirmed with Stripe once a day.
- Access is **per browser**. On another device, subscribers use
  **Go Ad-Free → Restore** and enter their email. (Trade-off: anyone who knows
  a subscriber's email could restore on their own device — acceptable for an
  ad-free perk, since there's no personal data behind it.)
- **Manage billing** opens the Stripe Customer Portal (cancel, change card,
  invoices).

## One-time setup

### 1. Create the product and price

```bash
node scripts/create-stripe-product.js sk_live_YOUR_SECRET_KEY
```

(Secret key: https://dashboard.stripe.com/apikeys — starts with `sk_live_`.)

This prints a `STRIPE_PRICE_ID` (starts with `price_`). Alternatively create a
product manually in the Dashboard (Product catalog → Add product → $9.99,
recurring yearly) and copy its price ID.

### 2. Configure Vercel environment variables

In the Vercel project: **Settings → Environment Variables** (Production):

| Name                | Value                                    |
| ------------------- | ---------------------------------------- |
| `STRIPE_SECRET_KEY` | `sk_live_...` (from the Stripe dashboard) |
| `STRIPE_PRICE_ID`   | `price_...` (from step 1)                 |

Then redeploy (or just push — the next deploy picks them up).

Note: the publishable key (`pk_live_...`) is **not needed** — Checkout is
created server-side and the browser is simply redirected to Stripe's URL.

### 3. Enable the Customer Portal (for "Manage billing")

Visit https://dashboard.stripe.com/settings/billing/portal and click **Save**
once to activate the default configuration.

## Coupon codes (including one-time-use)

Coupons are entered by the customer on the Stripe Checkout page — no code
changes needed (`allow_promotion_codes` is enabled).

1. Dashboard → **Product catalog → Coupons → + New**.
2. Pick the discount (e.g. 100% off) and duration:
   - **Once** = discounts the first year's invoice only.
   - **Forever** = free/discounted every year while subscribed.
3. Check **"Use customer-facing coupon codes"** and add a promotion code
   (e.g. `JEFF4LIFE`).
4. For a **one-time-use** code: under the promotion code's options, set
   **"Limit the number of times this code can be redeemed"** to `1`.
   Create as many single-use codes as you like under the same coupon
   (each code can have its own text).

## Local development

`npm start` serves only the React app — the `api/` functions won't run, so
subscribe/restore will fail locally. To test the full flow locally, install the
Vercel CLI and run `vercel dev` (it serves both the app and the functions; put
the two env vars in `.env.local` or link the project with `vercel env pull`).

## Files involved

- `api/` — serverless functions (checkout, verify, daily re-check, restore
  by email, billing portal). `api/_lib/` holds shared helpers.
- `src/lib/subscription.ts` — client-side subscription state + API calls.
- `src/components/modals/SubscribeModal.tsx` — subscribe/restore/manage UI.
- `src/App.tsx`, `src/components/navbar/Navbar.tsx` — hide ads/promos for
  subscribers; handle the return from Checkout.
- `public/index.html` — inline guard that skips ad scripts for subscribers.
- `scripts/create-stripe-product.js` — one-time product/price creation.
