const { getStripe, ACTIVE_STATUSES } = require('./_lib/stripe')
const { issueToken } = require('./_lib/token')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const stripe = getStripe()
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }

  const { sessionId } = req.body || {}
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing sessionId' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })
    const subscription = session.subscription
    const isActive =
      session.mode === 'subscription' &&
      subscription &&
      ACTIVE_STATUSES.includes(subscription.status)

    if (!isActive) {
      return res.status(200).json({ active: false })
    }

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer && session.customer.id
    const email =
      (session.customer_details && session.customer_details.email) || null

    return res.status(200).json({ active: true, ...issueToken(customerId, email) })
  } catch (err) {
    console.error('verify-session error:', err.message)
    return res.status(500).json({ error: 'Unable to verify checkout session' })
  }
}
