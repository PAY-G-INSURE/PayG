// Import mongoexport --jsonArray dumps into the PAYG Supabase schema.
// Run only after reviewing the dumps and executing supabase/schema.sql.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const inputDir = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const collections = ['users', 'subscriptions', 'transactions', 'claims', 'notifications']
const idMap = new Map()
const allowedColumns = {
  users: ['id','phone','email','firstName','lastName','dateOfBirth','gender','kinName','kinPhone','kinRelation','otp','otpExpiresAt','otpAttempts','isVerified','isOnboarded','isActive','role','paystackCustomerCode','createdAt','updatedAt'],
  subscriptions: ['id','userId','plan','status','walletBalance','coverageStartDate','coverageEndDate','lapsedAt','gracePeriodEnd','policyNumber','cancelledAt','cancellationNote','airtimeDeduction','createdAt','updatedAt'],
  transactions: ['id','userId','amount','type','status','paystackReference','paystackStatus','channel','description','metadata','verifiedAt','createdAt','updatedAt'],
  claims: ['id','userId','ref','type','description','hospital','treatmentDate','amountClaimed','amountApproved','status','reviewNote','reviewedBy','reviewedAt','documents','payoutReference','paidAt','createdAt','updatedAt'],
  notifications: ['id','userId','type','title','body','read','readAt','createdAt','updatedAt'],
}

function objectId(value) {
  if (typeof value === 'string') return value
  return value && typeof value === 'object' ? value.$oid || value._id || null : null
}

function uuidFor(value) {
  const sourceId = objectId(value)
  if (!sourceId) return crypto.randomUUID()
  if (!idMap.has(sourceId)) {
    const bytes = crypto.createHash('sha256').update(`payg-mongo:${sourceId}`).digest().subarray(0, 16)
    bytes[6] = (bytes[6] & 0x0f) | 0x50
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    idMap.set(sourceId, `${bytes.toString('hex').slice(0,8)}-${bytes.toString('hex').slice(8,12)}-${bytes.toString('hex').slice(12,16)}-${bytes.toString('hex').slice(16,20)}-${bytes.toString('hex').slice(20)}`)
  }
  return idMap.get(sourceId)
}

function decode(value) {
  if (Array.isArray(value)) return value.map(decode)
  if (!value || typeof value !== 'object') return value
  if (value.$oid) return value.$oid
  if (value.$date !== undefined) return new Date(typeof value.$date === 'object' ? value.$date.$numberLong : value.$date).toISOString()
  if (value.$numberInt !== undefined) return Number(value.$numberInt)
  if (value.$numberLong !== undefined) return Number(value.$numberLong)
  if (value.$numberDecimal !== undefined) return Number(value.$numberDecimal)
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, decode(child)]))
}

function loadCollection(name) {
  const file = path.join(inputDir, `${name}.json`)
  if (!fs.existsSync(file)) return []
  const content = fs.readFileSync(file, 'utf8').trim()
  if (!content) return []
  const parsed = content.startsWith('[') ? JSON.parse(content) : content.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
  return parsed.map(decode)
}

function mapRow(table, row) {
  const { _id, __v, user, userId, ...rest } = row
  const result = { ...rest, id: uuidFor(_id), createdAt: row.createdAt || new Date().toISOString(), updatedAt: row.updatedAt || new Date().toISOString() }
  const sourceUserId = objectId(user ?? userId)
  if (sourceUserId) result.userId = uuidFor(sourceUserId)
  if (table === 'users') {
    if (!result.role) result.role = 'user'
    if (result.otp === undefined) result.otp = null
    if (result.otpExpiresAt === undefined) result.otpExpiresAt = null
  }
  if (table === 'subscriptions') {
    result.airtimeDeduction = row.airtimeDeduction || { enabled: false, percentage: 10, network: null }
    if (!result.policyNumber) result.policyNumber = `PAYG-${new Date().getFullYear()}-${uuidFor(_id).slice(0, 8).toUpperCase()}`
  }
  if (table === 'transactions' && !result.paystackReference) delete result.paystackReference
  const allowed = new Set(allowedColumns[table])
  return Object.fromEntries(Object.entries(result).filter(([key]) => allowed.has(key)))
}

async function importTable(table, rows) {
  let imported = 0
  for (let offset = 0; offset < rows.length; offset += 200) {
    const batch = rows.slice(offset, offset + 200).map(row => mapRow(table, row))
    if (dryRun) { imported += batch.length; continue }
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    })
    if (!response.ok) throw new Error(`${table} import failed (${response.status}): ${await response.text()}`)
    imported += batch.length
  }
  console.log(`${dryRun ? 'Would import' : 'Imported'} ${imported} ${table}`)
}

async function main() {
  if (!inputDir) throw new Error('Usage: node scripts/import-mongo-json.js <mongoexport-json-directory> [--dry-run]')
  if (!dryRun && (!supabaseUrl || !serviceKey)) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing')
  // Users first so foreign key references can be mapped consistently.
  const ordered = ['users', 'subscriptions', 'transactions', 'claims', 'notifications']
  const source = Object.fromEntries(ordered.map(table => [table, loadCollection(table)]))
  for (const user of source.users) uuidFor(user._id)
  for (const table of collections) await importTable(table, source[table])
}

main().catch(error => { console.error(error.message); process.exitCode = 1 })
