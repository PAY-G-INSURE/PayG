const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(method, path, body, token = localStorage.getItem('payg_token')) {
  if (!BASE) throw new Error('API is not configured. Set VITE_API_BASE_URL for this deployment.')
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({ message: 'Request failed' }))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  auth: {
    sendOtp: (contact) => request('POST', '/auth/send-otp', typeof contact === 'string' ? { phone: contact } : contact, null),
    verifyOtp: (contact, otp) => request('POST', '/auth/verify-otp', typeof contact === 'string' ? { phone: contact, otp } : { ...contact, otp }, null),
    updateProfile: (data) => request('PUT', '/auth/profile', data),
    me: () => request('GET', '/auth/me'),
  },
  subscription: {
    get: () => request('GET', '/subscription'),
    changePlan: (planId) => request('POST', '/subscription/change', { planId }),
    cancel: (reason) => request('POST', '/subscription/cancel', reason ? { reason } : {}),
  },
  payments: {
    initialize: (amount) => request('POST', '/payments/initialize', { amount }),
    verify: (reference) => request('POST', '/payments/verify', { reference }),
    list: () => request('GET', '/payments'),
  },
  claims: {
    submit: (data) => request('POST', '/claims', data),
    list: () => request('GET', '/claims'),
  },
  notifications: {
    list: () => request('GET', '/notifications'),
    markRead: (id) => request('PUT', `/notifications/${id}/read`),
    markAllRead: () => request('PUT', '/notifications/read-all'),
  },
  airtime: {
    getSettings: () => request('GET', '/airtime/settings'),
    saveSettings: (data) => request('POST', '/airtime/settings', data),
  },
}

export default api
