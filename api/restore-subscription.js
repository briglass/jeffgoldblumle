const { getStripe, hasActiveSubscription } = require('./_lib/stripe')
const { issueToken } = require('./_lib/token')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const stripe = getStripe()
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing email' })
  }

  try {
    const customers = await stripe.customers.list({
      email: email.trim().toLowerCase(),
      limit: 10,
    })
    for (const customer of customers.data) {
      if (await hasActiveSubscription(stripe, customer.id)) {
        return res
          .status(200)
          .json({ active: true, ...issueToken(customer.id, customer.email) })
      }
    }
    return res.status(200).json({ active: false })
  } catch (err) {
    console.error('restore-subscription error:', err.message)
    return res.status(500).json({ error: 'Unable to look up subscription' })
  }
}
