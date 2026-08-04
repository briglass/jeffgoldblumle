const { getStripe, getOrigin, hasActiveSubscription } = require('./_lib/stripe')
const { issueMagicToken } = require('./_lib/token')
const { isOnFreeList } = require('./_lib/freeList')
const { sendMagicLinkEmail } = require('./_lib/email')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing email' })
  }
  const normalized = email.trim().toLowerCase()

  try {
    let eligible = isOnFreeList(normalized)
    if (!eligible) {
      const stripe = getStripe()
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured' })
      }
      const customers = await stripe.customers.list({
        email: normalized,
        limit: 10,
      })
      for (const customer of customers.data) {
        if (await hasActiveSubscription(stripe, customer.id)) {
          eligible = true
          break
        }
      }
    }

    if (!eligible) {
      return res.status(200).json({ eligible: false })
    }

    const magicUrl = `${getOrigin(req)}/?magic=${encodeURIComponent(
      issueMagicToken(normalized)
    )}`
    await sendMagicLinkEmail(normalized, magicUrl)
    return res.status(200).json({ eligible: true })
  } catch (err) {
    console.error('request-magic-link error:', err.message)
    return res.status(500).json({ error: 'Unable to send the sign-in link' })
  }
}
