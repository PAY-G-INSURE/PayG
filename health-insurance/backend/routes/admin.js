const express = require('express')
const rateLimit = require('express-rate-limit')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const { db } = require('../utils/db')
const { protectAdmin } = require('../middleware/adminAuth')
const { sendSMS } = require('../utils/sms')
const { createNotification } = require('../utils/notifications')

const router = express.Router()
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { success: false, message: 'Too many login attempts. Try again later.' } })
const PLAN_PRICE = { Basic: 500, Standard: 1000, Premium: 2000 }
const titleCase = value => String(value || '').split('_').map(part => part ? part[0].toUpperCase() + part.slice(1) : '').join(' ')
const statusKey = value => String(value || '').toLowerCase().replaceAll(' ', '_')

async function allRows(table, select = '*') {
  const rows = []
  for (let offset = 0; ; offset += 1000) {
    const page = await db.select(table, { select, order: 'createdAt.desc', offset, limit: 1000 })
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

router.post('/auth/login', loginLimit, [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Username and password are required' })
  const username = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  if (!username || !passwordHash || !process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Admin authentication is not configured on the server' })
  }
  const passwordMatches = await bcrypt.compare(req.body.password, passwordHash).catch(() => false)
  if (req.body.username !== username || !passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }
  const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ success: true, token, admin: { username } })
})

router.get('/auth/me', protectAdmin, (req, res) => res.json({ success: true, admin: req.admin }))
router.use(protectAdmin)

router.get('/stats', async (req, res, next) => {
  try {
    const [users, subs, claims, txns] = await Promise.all([
      allRows('users', 'id,phone,email,firstName,lastName,createdAt'),
      allRows('subscriptions'), allRows('claims'), allRows('transactions'),
    ])
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86400000)
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const successful = txns.filter(row => row.status === 'success')
    const revenue = since => successful.filter(row => new Date(row.createdAt) >= since).reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const subByUser = new Map(subs.map(sub => [sub.userId, sub]))
    const recentSignups = users.slice(0, 5).map(user => {
      const sub = subByUser.get(user.id)
      return { name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone || user.email || 'PAYG User', phone: user.phone || user.email, plan: sub?.plan || 'Basic', time: user.createdAt }
    })
    const userById = new Map(users.map(user => [user.id, user]))
    const recentPayments = successful.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(txn => {
      const user = userById.get(txn.userId)
      return { name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.phone || user?.email || 'PAYG User', channel: txn.channel || 'Paystack', amount: Number(txn.amount), time: txn.createdAt }
    })
    const wallet = subs.reduce((sum, sub) => sum + Number(sub.walletBalance || 0), 0)
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeSubscriptions: subs.filter(row => row.status === 'active').length,
        pendingSubscriptions: subs.filter(row => row.status === 'pending').length,
        inactiveSubscriptions: subs.filter(row => row.status === 'inactive' || row.status === 'lapsed').length,
        claimsPending: claims.filter(row => row.status === 'submitted').length,
        claimsUnderReview: claims.filter(row => row.status === 'under_review').length,
        revenueMonth: revenue(monthStart), revenueWeek: revenue(weekAgo), revenueToday: revenue(dayAgo), totalWalletBalance: wallet,
      }, recentSignups, recentPayments,
    })
  } catch (error) { next(error) }
})

router.get('/users', async (req, res, next) => {
  try {
    const [users, subs] = await Promise.all([allRows('users', 'id,phone,email,firstName,lastName,role,createdAt'), allRows('subscriptions')])
    const subByUser = new Map(subs.map(sub => [sub.userId, sub]))
    const search = String(req.query.search || '').toLowerCase()
    const status = statusKey(req.query.status)
    const joined = users.map(user => {
      const sub = subByUser.get(user.id)
      return {
        ...user, _id: user.id, name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone || user.email || 'PAYG User',
        plan: sub?.plan || 'Basic', wallet: Number(sub?.walletBalance || 0), status: sub?.status || 'inactive',
        policy: sub?.policyNumber || '—', joined: user.createdAt,
      }
    }).filter(user => user.role !== 'admin')
      .filter(user => !status || user.status === status)
      .filter(user => !search || [user.name, user.phone, user.email].some(value => String(value || '').toLowerCase().includes(search)))
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    res.json({ success: true, users: joined.slice((page - 1) * limit, page * limit), total: joined.length, pages: Math.max(1, Math.ceil(joined.length / limit)) })
  } catch (error) { next(error) }
})

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = (await db.select('users', { select: 'id,phone,email,firstName,lastName,role,createdAt', id: `eq.${req.params.id}`, limit: 1 }))[0]
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found' })
    const subscription = (await db.select('subscriptions', { userId: `eq.${user.id}`, limit: 1 }))[0]
    res.json({ success: true, user: {
      ...user, _id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone || user.email || 'PAYG User',
      plan: subscription?.plan || 'Basic', wallet: Number(subscription?.walletBalance || 0),
      status: subscription?.status || 'inactive', policy: subscription?.policyNumber || '—', joined: user.createdAt,
    } })
  } catch (error) { next(error) }
})

router.patch('/users/:id', [body('isActive').isBoolean()], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'isActive must be true or false' })
  try {
    const rows = await db.update('users', { id: `eq.${req.params.id}`, role: 'neq.admin' }, { isActive: req.body.isActive, updatedAt: new Date().toISOString() })
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user: { _id: rows[0].id, isActive: rows[0].isActive } })
  } catch (error) { next(error) }
})

router.get('/claims', async (req, res, next) => {
  try {
    const [claims, users] = await Promise.all([allRows('claims'), allRows('users', 'id,phone,email,firstName,lastName')])
    const userById = new Map(users.map(user => [user.id, user]))
    const search = String(req.query.search || '').toLowerCase()
    const wantedStatus = req.query.status ? statusKey(req.query.status) : ''
    const joined = claims.map(claim => {
      const user = userById.get(claim.userId)
      return {
        ...claim, _id: claim.id, id: claim.ref,
        user: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.phone || user?.email || 'PAYG User',
        phone: user?.phone || user?.email || '—', amount: Number(claim.amountClaimed), date: claim.treatmentDate,
        status: titleCase(claim.status),
      }
    }).filter(claim => !wantedStatus || statusKey(claim.status) === wantedStatus)
      .filter(claim => !search || [claim.id, claim.user, claim.phone, claim.hospital, claim.type].some(value => String(value || '').toLowerCase().includes(search)))
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = 20
    res.json({ success: true, claims: joined.slice((page - 1) * limit, page * limit), pages: Math.max(1, Math.ceil(joined.length / limit)), total: joined.length })
  } catch (error) { next(error) }
})

router.patch('/claims/:id', [
  body('status').isIn(['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid']),
  body('reviewNote').optional().isString().isLength({ max: 1000 }),
  body('amountApproved').optional().isFloat({ min: 0 }),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid claim review details' })
  try {
    const existing = await db.select('claims', { id: `eq.${req.params.id}`, limit: 1 })
    if (!existing[0]) return res.status(404).json({ success: false, message: 'Claim not found' })
    const claim = existing[0]
    const patch = {
      status: statusKey(req.body.status), reviewNote: req.body.reviewNote || null,
      reviewedBy: req.admin.username, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    if (req.body.amountApproved !== undefined) {
      if (Number(req.body.amountApproved) > Number(claim.amountClaimed)) return res.status(400).json({ success: false, message: 'Approved amount cannot exceed the amount claimed' })
      patch.amountApproved = Number(req.body.amountApproved)
    }
    if (patch.status === 'paid') patch.paidAt = new Date().toISOString()
    const rows = await db.update('claims', { id: `eq.${claim.id}` }, patch)
    const updated = rows[0]
    if (updated && ['approved', 'rejected'].includes(updated.status)) {
      const user = (await db.select('users', { id: `eq.${claim.userId}`, limit: 1 }))[0]
      if (user?.phone) await sendSMS(user.phone, updated.status === 'approved'
        ? `PAYG: Claim ${claim.ref} approved. We will update you on payment.`
        : `PAYG: Claim ${claim.ref} was not approved. ${updated.reviewNote || 'Contact support for details.'}`)
      await createNotification(claim.userId, 'claim', updated.status === 'approved' ? 'Claim approved' : 'Claim not approved', updated.reviewNote || `Your claim ${claim.ref} was ${updated.status}.`)
    }
    res.json({ success: true, claim: { ...updated, _id: updated.id, id: updated.ref, status: titleCase(updated.status), amount: Number(updated.amountClaimed), date: updated.treatmentDate } })
  } catch (error) { next(error) }
})

router.get('/transactions', async (req, res, next) => {
  try {
    const [transactions, users] = await Promise.all([allRows('transactions'), allRows('users', 'id,phone,email,firstName,lastName')])
    const userById = new Map(users.map(user => [user.id, user]))
    const search = String(req.query.search || '').toLowerCase()
    const joined = transactions.map(txn => {
      const user = userById.get(txn.userId)
      return { ...txn, _id: txn.id, reference: txn.paystackReference || txn.id, name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.phone || user?.email || 'PAYG User', amount: Number(txn.amount), date: txn.createdAt, channel: txn.channel || 'Paystack' }
    }).filter(txn => !search || [txn.reference, txn.name, txn.channel].some(value => String(value || '').toLowerCase().includes(search)))
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    res.json({ success: true, transactions: joined.slice((page - 1) * limit, page * limit), total: joined.length, pages: Math.max(1, Math.ceil(joined.length / limit)) })
  } catch (error) { next(error) }
})

router.get('/subscriptions/summary', async (req, res, next) => {
  try {
    const subscriptions = await allRows('subscriptions')
    const summary = { Basic: 0, Standard: 0, Premium: 0 }
    subscriptions.forEach(subscription => { if (summary[subscription.plan] !== undefined) summary[subscription.plan] += 1 })
    res.json({ success: true, summary })
  } catch (error) { next(error) }
})

router.patch('/subscriptions/:userId/wallet', [body('amount').isFloat()], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'A numeric amount is required' })
  try {
    const sub = (await db.select('subscriptions', { userId: `eq.${req.params.userId}`, limit: 1 }))[0]
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' })
    const nextBalance = Math.max(0, Number(sub.walletBalance) + Number(req.body.amount))
    const rows = await db.update('subscriptions', { id: `eq.${sub.id}` }, { walletBalance: nextBalance, updatedAt: new Date().toISOString() })
    res.json({ success: true, subscription: rows[0] })
  } catch (error) { next(error) }
})

router.post('/broadcast', [
  body('audience').isIn(['all', 'active', 'pending', 'inactive']),
  body('message').isString().trim().isLength({ min: 1, max: 160 }),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Choose an audience and enter a message up to 160 characters' })
  try {
    const [users, subs] = await Promise.all([allRows('users', 'id,phone,role'), allRows('subscriptions', 'userId,status')])
    const statusByUser = new Map(subs.map(sub => [sub.userId, sub.status]))
    const audienceStatus = { active: 'active', pending: 'pending', inactive: 'inactive' }[req.body.audience]
    const recipients = users.filter(user => user.role !== 'admin' && user.phone && (!audienceStatus || statusByUser.get(user.id) === audienceStatus))
    let sent = 0
    for (let i = 0; i < recipients.length; i += 10) {
      const results = await Promise.all(recipients.slice(i, i + 10).map(async user => {
        const result = await sendSMS(user.phone, req.body.message)
        if (result.success) {
          await createNotification(user.id, 'info', 'PAYG update', req.body.message)
          return true
        }
        return false
      }))
      sent += results.filter(Boolean).length
    }
    res.json({ success: true, sent, failed: recipients.length - sent, total: recipients.length })
  } catch (error) { next(error) }
})

module.exports = router
