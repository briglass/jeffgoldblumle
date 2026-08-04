const Stripe = require('stripe')

let stripeClient = null

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

const getOrigin = (req) => {
  if (req.headers.origin) return req.headers.origin
  return `https://${req.headers.host}`
}

const ACTIVE_STATUSES = ['active', 'trialing']

const hasActiveSubscription = async (stripe, customerId) => {
  for (const status of ACTIVE_STATUSES) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status,
      limit: 1,
    })
    if (subs.data.length > 0) return true
  }
  return false
}

module.exports = { getStripe, getOrigin, ACTIVE_STATUSES, hasActiveSubscription }
