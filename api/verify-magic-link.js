const { getStripe, hasActiveSubscription } = require('./_lib/stripe')
const { issueToken, verifyToken } = require('./_lib/token')
const { isOnFreeList } = require('./_lib/freeList')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { magicToken } = req.body || {}
  const payload = verifyToken(magicToken)
  if (!payload || payload.p !== 'magic' || !payload.e) {
    return res.status(200).json({ active: false, reason: 'invalid' })
  }
  if (!(payload.exp > Date.now())) {
    return res.status(200).json({ active: false, reason: 'expired' })
  }
  const email = payload.e

  try {
    if (isOnFreeList(email)) {
      return res
        .status(200)
        .json({ active: true, ...issueToken(`free:${email}`, email) })
    }

    const stripe = getStripe()
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' })
    }
    const customers = await stripe.customers.list({ email, limit: 10 })
    for (const customer of customers.data) {
      if (await hasActiveSubscription(stripe, customer.id)) {
        return res
          .status(200)
          .json({ active: true, ...issueToken(customer.id, email) })
      }
    }
    return res.status(200).json({ active: false, reason: 'no-subscription' })
  } catch (err) {
    console.error('verify-magic-link error:', err.message)
    return res.status(500).json({ error: 'Unable to verify the sign-in link' })
  }
}
