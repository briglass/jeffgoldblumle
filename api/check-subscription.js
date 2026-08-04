const { getStripe, hasActiveSubscription } = require('./_lib/stripe')
const { issueToken, verifyToken } = require('./_lib/token')
const { isOnFreeList } = require('./_lib/freeList')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body || {}
  const payload = verifyToken(token)
  if (!payload || !payload.c) {
    return res.status(200).json({ active: false })
  }

  // Complimentary access: active for as long as the email stays on the list
  if (payload.c.startsWith('free:')) {
    if (payload.e && isOnFreeList(payload.e)) {
      return res
        .status(200)
        .json({ active: true, ...issueToken(payload.c, payload.e) })
    }
    return res.status(200).json({ active: false })
  }

  const stripe = getStripe()
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' })
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
