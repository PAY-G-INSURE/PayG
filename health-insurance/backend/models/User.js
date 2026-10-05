const { model, fieldsToDb } = require('../utils/modelCompat')
module.exports = model('users', { decorate: user => user && ({
  ...user,
  get fullName() { return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone || user.email || 'PAYG User' },
  async save() {
    const { db } = require('../utils/db')
    const rows = await db.update('users', { id: `eq.${user._id}` }, fieldsToDb(user))
    Object.assign(user, rows[0] || {})
    return user
  },
}) })
