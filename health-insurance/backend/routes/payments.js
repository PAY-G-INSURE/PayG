const express = require('express')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const Transaction = require('../models/Transaction')
const { protect } = require('../middleware/auth')
const { db } = require('../utils/db')
const paystack = require('../utils/paystack')
const { sendPaymentReceived, sendCoverageActive, sendCoverageLow } = require('../utils/sms')
const notif = require('../utils/notifications')

const router = express.Router()

async function settle(reference, userId, koboAmount, channel) {
  return db.rpc('finalize_paystack_payment', {
    p_reference: reference,
    p_user_id: userId,
    p_amount: Number((koboAmount / 100).toFixed(2)),
    p_channel: channel || 'Paystack',
  })
}

async function sendSettlementMessages(user, settlement, amount) {
  const subscription = settlement.subscription
  if (!subscription) return
  if (subscription.status === 'active') {
    await notif.coverageActive(user._id || user.id, subscription.plan)
  } else {
    const remaining = Math.max(0, Number(subscription.planPrice) - Number(subscription.walletBalance))
    await notif.coverageLow(user._id || user.id, remaining)
  }
  if (!user.phone) return
  await sendPaymentReceived(user.phone, amount, Number(subscription.walletBalance))
  if (subscription.status === 'active') await sendCoverageActive(user.phone, subscription.plan, subscription.coverageEndDate)
  else await sendCoverageLow(user.phone, Math.max(0, Number(subscription.planPrice) - Number(subscription.walletBalance)), subscription.plan)
}

router.post('/initialize', protect, [
  body('amount').isInt({ min: 100, max: 10000000 }).withMessage('Amount must be between ₦100 and ₦10,000,000'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
  try {
    const amount = Number(req.body.amount)
    const reference = `PAYG_${crypto.randomUUID()}`
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      status: 'pending',
      paystackReference: reference,
      description: `Wallet top-up — ${amount}`,
    })
    res.json({ success: true, reference, transactionId: transaction._id })
  } catch (error) {
    console.error('initialize payment error:', error)
    res.status(500).json({ success: false, message: 'Failed to initialize payment' })
  }
})

router.post('/verify', protect, [body('reference').isString().trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
  try {
    const { reference } = req.body
    const payment = await paystack.verifyTransaction(reference)
    if (!payment.status || payment.data?.status !== 'success' || payment.data?.currency !== 'NGN') {
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }
    const settlement = await settle(reference, req.user._id, payment.data.amount, payment.data.channel)
    if (settlement.processed) await sendSettlementMessages(req.user, settlement, Number(payment.data.amount) / 100)
    res.json({ success: true, message: 'Payment verified', amount: Number(payment.data.amount) / 100, subscription: settlement.subscription })
  } catch (error) {
    console.error('verify payment error:', error)
    const status = error.status === 400 ? 400 : error.status === 404 ? 404 : 500
    res.status(status).json({ success: false, message: status === 500 ? 'Payment verification failed' : error.message })
  }
})

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature']
  if (!paystack.verifyWebhookSignature(req.body, signature)) return res.status(401).send('Unauthorized')
  res.sendStatus(200)
  try {
    const event = JSON.parse(req.body.toString())
    if (event.event !== 'charge.success' || event.data?.currency !== 'NGN') return
    const { reference, amount, channel } = event.data
    const rows = await db.select('transactions', { paystackReference: `eq.${reference}`, select: 'id,"userId",amount,status', limit: 1 })
    const transaction = rows[0]
    if (!transaction) return console.warn(`Paystack webhook: no pending transaction for ${reference}`)
    const settlement = await settle(reference, transaction.userId, amount, channel)
    if (settlement.processed) {
      const users = await db.select('users', { id: `eq.${transaction.userId}`, limit: 1 })
      const user = users[0]
      if (user) await sendSettlementMessages({ ...user, _id: user.id }, settlement, amount / 100)
    }
  } catch (error) {
    console.error('Paystack webhook processing error:', error)
  }
})

router.get('/', protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const transactions = await Transaction.find({ user: req.user._id, status: 'success' })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-__v')
    const total = await Transaction.countDocuments({ user: req.user._id, status: 'success' })
    res.json({ success: true, transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('get payments error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' })
  }
})

module.exports = router
