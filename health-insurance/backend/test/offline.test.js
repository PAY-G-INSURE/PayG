const test = require('node:test')
const assert = require('node:assert/strict')

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
