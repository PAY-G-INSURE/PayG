const test = require('node:test')
const assert = require('node:assert/strict')

test('patched messaging SDK retains its expected local interface', () => {
  const sdk = require('africastalking')({ apiKey: 'offline-fixture', username: 'sandbox' })
  assert.equal(typeof sdk.SMS.send, 'function')
})

test('CORS admits listed origins and wildcard preview origins only', async () => {
  process.env.NODE_ENV = 'test'
  process.env.FRONTEND_URL = 'https://payg-health.netlify.app, https://*--payg-health.netlify.app'
  delete require.cache[require.resolve('../server')]
  const app = require('../server')
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const allowed = async origin => {
    const response = await fetch(`${base}/missing`, { headers: { Origin: origin } })
    await response.text()
    return response.headers.get('access-control-allow-origin') === origin
  }
  try {
    assert.ok(await allowed('https://payg-health.netlify.app'))
    assert.ok(await allowed('https://deploy-preview-12--payg-health.netlify.app'))
    assert.ok(await allowed('https://develop--payg-health.netlify.app'))
    assert.ok(!(await allowed('https://evil.com')))
    assert.ok(!(await allowed('https://a.b--payg-health.netlify.app')))
    assert.ok(!(await allowed('https://develop--payg-health.netlify.app.evil.com')))
  } finally {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    delete process.env.FRONTEND_URL
    delete require.cache[require.resolve('../server')]
  }
})

test('health failure hides provider details and private routes reject anonymous requests', async () => {
  process.env.NODE_ENV = 'test'
  const { db } = require('../utils/db')
  const original = db.health
  db.health = async () => { throw new Error('private-provider-details') }
  const app = require('../server')
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const health = await fetch(`${base}/health`)
    assert.equal(health.status, 503)
    assert.ok(!(await health.text()).includes('private-provider-details'))
    const response = await fetch(`${base}/api/auth/me`)
    assert.equal(response.status, 401)
    assert.equal((await fetch(`${base}/missing`)).status, 404)
  } finally {
    db.health = original
    await new Promise(resolve => server.close(resolve))
  }
})
