export type StoredSubscription = {
  token: string
  customerId: string
  email: string | null
  expiresAt: number
  lastVerifiedAt: number
}

// Also read by the inline script in public/index.html that decides whether to
// load the ad network scripts at all — keep the key and shape in sync.
const STORAGE_KEY = 'adFreeSubscription'
const REVERIFY_INTERVAL_MS = 24 * 60 * 60 * 1000 // re-check with Stripe daily

export const getStoredSubscription = (): StoredSubscription | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const sub = JSON.parse(raw)
    if (
      !sub ||
      typeof sub.token !== 'string' ||
      typeof sub.expiresAt !== 'number'
    ) {
      return null
    }
    return sub as StoredSubscription
  } catch (e) {
    return null
  }
}

export const isSubscriberNow = (): boolean => {
  const sub = getStoredSubscription()
  return !!sub && sub.expiresAt > Date.now()
}

const saveSubscription = (data: {
  token: string
  customerId: string
  email: string | null
  expiresAt: number
}) => {
  const stored: StoredSubscription = { ...data, lastVerifiedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export const clearSubscription = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const postJson = async (url: string, body: object) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = await res.json()
      if (data && data.error) message = data.error
    } catch (e) {}
    throw new Error(message)
  }
  return res.json()
}

export const startCheckout = async () => {
  const data = await postJson('/api/create-checkout-session', {})
  if (!data.url) throw new Error('Unable to start checkout')
  window.location.assign(data.url)
}

export const verifyCheckoutSession = async (
  sessionId: string
): Promise<boolean> => {
  try {
    const data = await postJson('/api/verify-session', { sessionId })
    if (data.active && data.token) {
      saveSubscription(data)
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

export const refreshSubscriptionStatus = async (): Promise<boolean> => {
  const sub = getStoredSubscription()
  if (!sub) return false
  const recentlyVerified =
    Date.now() - (sub.lastVerifiedAt || 0) < REVERIFY_INTERVAL_MS
  if (recentlyVerified && sub.expiresAt > Date.now()) return true
  try {
    const data = await postJson('/api/check-subscription', { token: sub.token })
    if (data.active && data.token) {
      saveSubscription(data)
      return true
    }
    clearSubscription()
    return false
  } catch (e) {
    // Network/server hiccup: keep current status until the token itself
    // expires rather than yanking the ad-free experience away.
    return sub.expiresAt > Date.now()
  }
}

// Asks the server to email a one-time sign-in link. Resolves true if the
// email has access (link sent), false if it has no subscription/free access.
export const requestMagicLink = async (email: string): Promise<boolean> => {
  const data = await postJson('/api/request-magic-link', { email })
  return !!data.eligible
}

export const verifyMagicLink = async (magicToken: string): Promise<boolean> => {
  try {
    const data = await postJson('/api/verify-magic-link', { magicToken })
    if (data.active && data.token) {
      saveSubscription(data)
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

// Free-list users get a synthetic "free:<email>" customer id — they have no
// Stripe billing to manage.
export const hasComplimentaryAccess = (): boolean => {
  const sub = getStoredSubscription()
  return (
    !!sub &&
    typeof sub.customerId === 'string' &&
    sub.customerId.startsWith('free:')
  )
}

export const openBillingPortal = async () => {
  const sub = getStoredSubscription()
  if (!sub) throw new Error('No subscription on this device')
  const data = await postJson('/api/create-portal-session', {
    token: sub.token,
  })
  if (!data.url) throw new Error('Unable to open billing portal')
  window.location.assign(data.url)
}
