const { getStripe, hasActiveSubscription } = require('./_lib/stripe')
const { issueToken, verifyToken } = require('./_lib/token')

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
    return res.status(200).json({ active: false })
  }

  try {
    const active = await hasActiveSubscription(stripe, payload.c)
    if (!active) {
      return res.status(200).json({ active: false })
    }
    return res
      .status(200)
      .json({ active: true, ...issueToken(payload.c, payload.e) })
  } catch (err) {
    console.error('check-subscription error:', err.message)
    return res.status(500).json({ error: 'Unable to check subscription' })
  }
}
