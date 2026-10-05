// Minimal server-side Supabase PostgREST client. Uses Node's built-in fetch so
// no database secret or privileged key is shipped to the browser.
const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function assertConfigured() {
  if (!baseUrl || !serviceKey) {
    const error = new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    error.status = 503
    throw error
  }
}

async function request(path, { method = 'GET', body, headers = {}, count = false } = {}) {
  assertConfigured()
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(body !== undefined ? { Prefer: 'return=representation' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const raw = await response.text()
  let data
  try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || `Supabase request failed (${response.status})`)
    error.status = response.status
    error.details = data
    throw error
  }
  const range = response.headers.get('content-range')
  return { data, count: count && range ? Number(range.split('/')[1]) || 0 : undefined }
}

function queryString(params) {
  return new URLSearchParams(params).toString()
}

const db = {
  async health() {
    await request('users?select=id&limit=1')
    return true
  },
  async select(table, params = {}, options = {}) {
    const { data, count } = await request(`${table}?${queryString(params)}`, {
      headers: options.count ? { Prefer: 'count=exact' } : {}, count: options.count,
    })
    return options.count ? { rows: data || [], count } : (data || [])
  },
  async insert(table, row, options = {}) {
    const { data } = await request(`${table}?${options.onConflict ? `on_conflict=${encodeURIComponent(options.onConflict)}` : ''}`, {
      method: 'POST', body: row,
      headers: options.upsert ? { Prefer: 'resolution=merge-duplicates,return=representation' } : {},
    })
    return Array.isArray(data) ? data[0] : data
  },
  async update(table, params, patch) {
    const { data } = await request(`${table}?${queryString(params)}`, { method: 'PATCH', body: patch })
    return data || []
  },
  async remove(table, params) {
    return request(`${table}?${queryString(params)}`, { method: 'DELETE' })
  },
  async rpc(name, args = {}) {
    const { data } = await request(`rpc/${name}`, { method: 'POST', body: args })
    return data
  },
}

module.exports = { db }
