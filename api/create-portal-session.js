const { getStripe, getOrigin } = require('./_lib/stripe')
const { verifyToken } = require('./_lib/token')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const stripe = getStripe()
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }

  const { token } = req.body || {}
  const payload = verifyToken(token)
  if (!payload || !payload.c) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: payload.c,
      return_url: `${getOrigin(req)}/`,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-portal-session error:', err.message)
    return res.status(500).json({ error: 'Unable to open billing portal' })
  }
}
