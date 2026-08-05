# Ad-Free Subscription — Setup & Operations

The site sells a **$5/year ad-free subscription** via Stripe Checkout.
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
  **Go Ad-Free → Send link**: they enter their email and receive a one-time
  **magic sign-in link** (expires in 15 minutes). Opening it on a device
  activates ad-free access there. Only the inbox owner can get access.
- **Free access list**: emails in the `FREE_ACCESS_EMAILS` environment
  variable (friends, family, you) get ad-free access without paying — they use
  the same "Send link" flow. See below.
- **Manage billing** opens the Stripe Customer Portal (cancel, change card,
  invoices). Free-list users don't see it — they have no billing.

## One-time setup

### 1. Create the product and price

```bash
node scripts/create-stripe-product.js sk_live_YOUR_SECRET_KEY
```

(Secret key: https://dashboard.stripe.com/apikeys — starts with `sk_live_`.)

This prints a `STRIPE_PRICE_ID` (starts with `price_`). Alternatively create a
product manually in the Dashboard (Product catalog → Add product → $5,
recurring yearly) and copy its price ID.

**Changing the price later:** the charged amount comes from the Stripe price
behind `STRIPE_PRICE_ID`, not from the code — but the UI text (App.tsx,
StatsModal.tsx, SubscribeModal.tsx) states the price and must be kept in sync.
To change it: create a new price (re-run the script or use the Dashboard),
set the new ID in `STRIPE_PRICE_ID`, redeploy, and update the UI text.
Existing subscribers keep their old price until they cancel.

### 2. Configure Vercel environment variables

In the Vercel project: **Settings → Environment Variables** (Production):

| Name                 | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`  | `sk_live_...` (from the Stripe dashboard)                     |
| `STRIPE_PRICE_ID`    | `price_...` (from step 1)                                     |
| `RESEND_API_KEY`     | `re_...` (from step 4 — needed for magic sign-in links)       |
| `MAGIC_LINK_FROM`    | optional; e.g. `JEFFGOLDBLUMLE <noreply@jeffgoldblumle.com>` |
| `FREE_ACCESS_EMAILS` | optional; comma-separated free-access list (see below)        |

Then redeploy (or just push — the next deploy picks them up). **Env var
changes only take effect after a redeploy.**

Note: the publishable key (`pk_live_...`) is **not needed** — Checkout is
created server-side and the browser is simply redirected to Stripe's URL.

### 3. Enable the Customer Portal (for "Manage billing")

Visit https://dashboard.stripe.com/settings/billing/portal and click **Save**
once to activate the default configuration.

### 4. Set up Resend (sends the magic sign-in links)

1. Sign up at https://resend.com (free tier: 3,000 emails/month).
2. **Domains → Add domain** → `jeffgoldblumle.com`, then add the DNS records
   Resend shows you (SPF + DKIM) at your DNS host and wait for it to verify.
   Until the domain verifies, Resend can only send to your own account email.
3. **API Keys → Create API key**, and set it as `RESEND_API_KEY` on Vercel.
4. Optionally set `MAGIC_LINK_FROM` — the address must be on the verified
   domain. Defaults to `JEFFGOLDBLUMLE <noreply@jeffgoldblumle.com>`.

## Free access for friends & family

Set the `FREE_ACCESS_EMAILS` environment variable on Vercel to a
comma-separated list:

```
FREE_ACCESS_EMAILS=briglass@gmail.com, friend@example.com, mom@example.com
```

Redeploy after editing it. People on the list never touch Stripe:

1. They open the site → **Go Ad-Free → "Already have access?" → Send link**.
2. They enter their email and click the link that arrives. Done.

Removing an email from the list (and redeploying) revokes their access within
a day (the app re-confirms daily), 30 days at the absolute worst case.

An alternative for one-offs: create a **100%-off forever** promo code (see
Coupon codes below) — checkout skips card entry for fully-discounted
subscriptions, and they'll show up in Stripe as regular $0 subscribers.

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

- `api/` — serverless functions (checkout, verify, daily re-check, magic
  sign-in links, billing portal). `api/_lib/` holds shared helpers, including
  the email sender (`_lib/email.js` — swap this file to change providers) and
  the free list check (`_lib/freeList.js`).
- `src/lib/subscription.ts` — client-side subscription state + API calls.
- `src/components/modals/SubscribeModal.tsx` — subscribe/restore/manage UI.
- `src/App.tsx`, `src/components/navbar/Navbar.tsx` — hide ads/promos for
  subscribers; handle the return from Checkout.
- `public/index.html` — inline guard that skips ad scripts for subscribers.
- `scripts/create-stripe-product.js` — one-time product/price creation.
