const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'payg_admin_token'

async function fetchJson(path, options = {}, token = sessionStorage.getItem(TOKEN_KEY)) {
  if (!BASE) throw new Error('API is not configured. Set VITE_API_BASE_URL.')
  const response = await fetch(`${BASE}/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({ message: 'Request failed' }))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const loginAdmin = (username, password) => fetchJson('/auth/login', {
  method: 'POST', body: JSON.stringify({ username, password }),
}, null)
export const verifyAdmin = () => fetchJson('/auth/me')
export const adminFetch = (path, options) => fetchJson(path, options)

export const getStats = () => adminFetch('/stats')
export const getUsers = (params = {}) => adminFetch(`/users?${new URLSearchParams(params)}`)
export const getUserDetail = id => adminFetch(`/users/${id}`)
export const updateUser = (id, body) => adminFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const getClaims = (params = {}) => adminFetch(`/claims?${new URLSearchParams(params)}`)
export const updateClaim = (id, body) => adminFetch(`/claims/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const getTransactions = (params = {}) => adminFetch(`/transactions?${new URLSearchParams(params)}`)
export const getSubscriptionSummary = () => adminFetch('/subscriptions/summary')
export const adjustWallet = (userId, body) => adminFetch(`/subscriptions/${userId}/wallet`, { method: 'PATCH', body: JSON.stringify(body) })
export const sendBroadcast = body => adminFetch('/broadcast', { method: 'POST', body: JSON.stringify(body) })
