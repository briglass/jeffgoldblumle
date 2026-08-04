const { getStripe, getOrigin } = require('./_lib/stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const stripe = getStripe()
  if (!stripe || !process.env.STRIPE_PRICE_ID) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }

  const origin = getOrigin(req)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      // Lets 100%-off coupon codes check out without entering a card
      payment_method_collection: 'if_required',
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err.message)
    return res.status(500).json({ error: 'Unable to start checkout' })
  }
}
