// One-time setup: creates the ad-free subscription product and yearly price
// in your Stripe account, then prints the price ID to configure on Vercel.
//
// Usage:
//   node scripts/create-stripe-product.js sk_live_XXXX
//
const Stripe = require('stripe')

const key = process.argv[2] || process.env.STRIPE_SECRET_KEY
if (!key || !key.startsWith('sk_')) {
  console.error('Usage: node scripts/create-stripe-product.js <STRIPE_SECRET_KEY>')
  console.error('Get your secret key at https://dashboard.stripe.com/apikeys')
  process.exit(1)
}

const stripe = new Stripe(key)

;(async () => {
  const product = await stripe.products.create({
    name: 'JEFFGOLDBLUMLE Ad-Free',
    description: 'Ad-free experience on jeffgoldblumle.com — just the raw game.',
  })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'year' },
  })
  console.log(`Created product: ${product.id}`)
  console.log(`Created price:   ${price.id} ($9.99/year)`)
  console.log('')
  console.log('Now add these environment variables to your Vercel project')
  console.log('(Settings > Environment Variables), then redeploy:')
  console.log('')
  console.log(`  STRIPE_SECRET_KEY = ${key.slice(0, 11)}... (the full key)`)
  console.log(`  STRIPE_PRICE_ID   = ${price.id}`)
})().catch((err) => {
  console.error('Stripe error:', err.message)
  process.exit(1)
})
