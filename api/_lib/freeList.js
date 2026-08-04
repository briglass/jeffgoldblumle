// Comma-separated list of emails granted complimentary ad-free access,
// e.g. FREE_ACCESS_EMAILS=me@example.com, friend@example.com
const isOnFreeList = (email) =>
  (process.env.FREE_ACCESS_EMAILS || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(String(email).trim().toLowerCase())

module.exports = { isOnFreeList }
