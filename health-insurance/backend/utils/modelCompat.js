const { db } = require('./db')

const fieldsToDb = (value = {}) => {
  const out = {}
  for (const [key, val] of Object.entries(value)) {
    if (key === '__v' || key === 'fullName' || key === 'planPrice' || key === 'remainingBalance' || key === 'daysUntilExpiry' || key === 'refreshStatus' || key === 'save') continue
    const target = key === '_id' ? 'id' : key === 'user' ? 'userId' : key
    out[target] = val === undefined ? null : val
  }
  return out
}

const fieldsToApp = (row) => {
  if (!row) return row
  const out = { ...row, _id: row.id }
  if (row.userId !== undefined) out.user = row.userId
  delete out.userId
  return out
}

function toFilter(filter = {}) {
  const params = {}
  for (const [key, value] of Object.entries(filter)) {
    const target = key === '_id' ? 'id' : key === 'user' ? 'userId' : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const op = Object.keys(value)[0]
      const operators = { $gte: 'gte', $gt: 'gt', $lte: 'lte', $lt: 'lt', $ne: 'neq', $in: 'in' }
      if (operators[op]) params[target] = `${operators[op]}.${op === '$in' ? `(${value[op].join(',')})` : value[op]}`
    } else {
      params[target] = `eq.${value}`
    }
  }
  return params
}

function createQuery(table, filter, transform = fieldsToApp) {
  const state = { params: toFilter(filter), one: false }
  const query = {
    sort(order = {}) {
      state.params.order = Object.entries(order).map(([field, dir]) => `${field}.${dir < 0 ? 'desc' : 'asc'}`).join(',')
      return query
    },
    limit(value) { state.params.limit = value; return query },
    skip(value) { state.params.offset = value; return query },
    select() { return query },
    async exec() {
      const rows = await db.select(table, state.params)
      const result = rows.map(transform)
      return state.one ? (result[0] || null) : result
    },
    then(resolve, reject) { return query.exec().then(resolve, reject) },
    catch(reject) { return query.exec().catch(reject) },
  }
  return query
}

function model(table, { transform = fieldsToApp, decorate = row => row } = {}) {
  const decorateRow = row => {
    if (!row) return row
    const appRow = decorate(transform(row))
    if (!appRow.save) {
      appRow.save = async function () {
        const values = fieldsToDb(this)
        delete values.id
        const rows = await db.update(table, { id: `eq.${this._id}` }, values)
        if (rows[0]) Object.assign(this, transform(rows[0]))
        return this
      }
    }
    return appRow
  }
  return {
    find(filter = {}) { return createQuery(table, filter, decorateRow) },
    findOne(filter = {}) {
      const query = createQuery(table, filter, decorateRow)
      query.stateOne = true
      const original = query.exec
      query.exec = async () => {
        const rows = await db.select(table, { ...toFilter(filter), limit: 1 })
        return rows[0] ? decorateRow(rows[0]) : null
      }
      query.then = (resolve, reject) => query.exec().then(resolve, reject)
      query.catch = reject => query.exec().catch(reject)
      return query
    },
    async create(input) {
      const row = await db.insert(table, fieldsToDb(input))
      return row ? decorateRow(row) : row
    },
    async findById(id) {
      const rows = await db.select(table, { id: `eq.${id}`, limit: 1 })
      return rows[0] ? decorateRow(rows[0]) : null
    },
    async findByIdAndUpdate(id, patch) {
      const rows = await db.update(table, { id: `eq.${id}` }, fieldsToDb(patch))
      return rows[0] ? decorateRow(rows[0]) : null
    },
    async findOneAndUpdate(filter, patch) {
      const values = patch.$set ? patch.$set : patch
      const normalized = { ...values }
      for (const [key, value] of Object.entries(values)) {
        if (!key.includes('.')) continue
        const [parent, child] = key.split('.')
        normalized[parent] = { ...(normalized[parent] || {}), [child]: value }
        delete normalized[key]
      }
      const rows = await db.update(table, toFilter(filter), fieldsToDb(normalized))
      return rows[0] ? decorateRow(rows[0]) : null
    },
    async countDocuments(filter = {}) {
      const result = await db.select(table, { ...toFilter(filter), select: 'id' }, { count: true })
      return result.count
    },
    async updateMany(filter, patch) {
      const values = patch.$set || patch
      return db.update(table, toFilter(filter), fieldsToDb(values))
    },
  }
}

module.exports = { model, fieldsToDb, fieldsToApp }
