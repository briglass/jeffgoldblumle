const crypto = require('crypto')

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const MAGIC_TTL_MS = 15 * 60 * 1000 // sign-in links are short-lived

// Tokens are HMAC-signed so the client cannot forge subscriber status.
// A dedicated secret can be set via SUBSCRIPTION_TOKEN_SECRET; otherwise one
// is derived from the Stripe secret key (already high-entropy and private).
const getSecret = () => {
  if (process.env.SUBSCRIPTION_TOKEN_SECRET) {
    return process.env.SUBSCRIPTION_TOKEN_SECRET
  }
  return crypto
    .createHash('sha256')
    .update(`jgle-sub-token:${process.env.STRIPE_SECRET_KEY || ''}`)
    .digest('hex')
}

const sign = (encodedPayload) =>
  crypto.createHmac('sha256', getSecret()).update(encodedPayload).digest('hex')

const issueToken = (customerId, email) => {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = { c: customerId, e: email || null, exp: expiresAt }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return {
    token: `${encoded}.${sign(encoded)}`,
    customerId,
    email: email || null,
    expiresAt,
  }
}

const issueMagicToken = (email) => {
  const payload = { p: 'magic', e: email, exp: Date.now() + MAGIC_TTL_MS }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

const verifyToken = (token) => {
  if (typeof token !== 'string') return null
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null
  const expected = sign(encoded)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
  } catch (e) {
    return null
  }
}

module.exports = { issueToken, issueMagicToken, verifyToken }
