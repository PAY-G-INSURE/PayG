const { model, fieldsToDb } = require('../utils/modelCompat')
const { db } = require('../utils/db')

const PLANS = { Basic: { price: 500, id: 1 }, Standard: { price: 1000, id: 2 }, Premium: { price: 2000, id: 3 } }

function decorate(row) {
  if (!row) return row
  const subscription = { ...row }
  Object.defineProperties(subscription, {
    planPrice: { enumerable: true, get: () => PLANS[subscription.plan]?.price || 0 },
    remainingBalance: { enumerable: true, get: () => Math.max(0, (PLANS[subscription.plan]?.price || 0) - Number(subscription.walletBalance || 0)) },
    daysUntilExpiry: { enumerable: true, get: () => subscription.coverageEndDate ? Math.max(0, Math.ceil((new Date(subscription.coverageEndDate) - Date.now()) / 86400000)) : 0 },
  })
  subscription.refreshStatus = function () {
    const price = PLANS[this.plan]?.price || 0
    if (Number(this.walletBalance) >= price) {
      this.status = 'active'
      if (!this.coverageStartDate) this.coverageStartDate = new Date().toISOString()
      const end = new Date(); end.setMonth(end.getMonth() + 1); end.setDate(1); end.setHours(0, 0, 0, 0)
      this.coverageEndDate = end.toISOString()
      this.lapsedAt = null
    } else if (Number(this.walletBalance) > 0) this.status = 'pending'
    else this.status = 'inactive'
  }
  subscription.save = async function () {
    const values = { ...this }
    for (const key of ['_id', 'planPrice', 'remainingBalance', 'daysUntilExpiry', 'refreshStatus', 'save']) delete values[key]
    const rows = await db.update('subscriptions', { id: `eq.${this._id}` }, fieldsToDb(values))
    if (rows[0]) Object.assign(this, rows[0])
    return this
  }
  return subscription
}

const Subscription = model('subscriptions', { decorate })
module.exports = Subscription
module.exports.PLANS = PLANS
