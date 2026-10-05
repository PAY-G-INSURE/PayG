const express = require('express')
const { body, validationResult } = require('express-validator')

const Subscription = require('../models/Subscription')
const { protect } = require('../middleware/auth')
const notif = require('../utils/notifications')
const { sendSMS } = require('../utils/sms')

const router = express.Router()

// All subscription routes require auth
router.use(protect)

// ─── GET /api/subscription ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let sub = await Subscription.findOne({ user: req.user._id })
    if (!sub) {
      sub = await Subscription.create({ user: req.user._id })
    }

    res.json({
      success: true,
      subscription: {
        id: sub._id,
        plan: sub.plan,
        status: sub.status,
        walletBalance: sub.walletBalance,
        planPrice: sub.planPrice,
        remainingBalance: sub.remainingBalance,
        coverageStartDate: sub.coverageStartDate,
        coverageEndDate: sub.coverageEndDate,
        daysUntilExpiry: sub.daysUntilExpiry,
        policyNumber: sub.policyNumber,
      },
    })
  } catch (err) {
    console.error('get subscription error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' })
  }
})

// ─── POST /api/subscription/change ───────────────────────────────────────────
router.post(
  '/change',
  [body('planId').isIn([1, 2, 3]).withMessage('Invalid plan')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const planMap = { 1: 'Basic', 2: 'Standard', 3: 'Premium' }
    const newPlanName = planMap[req.body.planId]

    try {
      const sub = await Subscription.findOne({ user: req.user._id })
      if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' })

      const oldPlan = sub.plan
      sub.plan = newPlanName

      // Reset wallet when changing plan — user pays fresh for new plan
      if (oldPlan !== newPlanName) {
        sub.walletBalance = 0
        sub.status = 'pending'
      }

      await sub.save()

      res.json({
        success: true,
        message: `Plan changed to ${newPlanName}`,
        subscription: {
          plan: sub.plan,
          status: sub.status,
          walletBalance: sub.walletBalance,
          planPrice: sub.planPrice,
          policyNumber: sub.policyNumber,
        },
      })
    } catch (err) {
      console.error('change plan error:', err)
      res.status(500).json({ success: false, message: 'Failed to change plan' })
    }
  }
)

// ─── POST /api/subscription/cancel ───────────────────────────────────────────
router.post('/cancel', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id })
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' })

    sub.status = 'inactive'
    sub.cancelledAt = new Date()
    sub.cancellationNote = req.body.reason || 'User requested cancellation'
    await sub.save()

    // Send SMS
    if (req.user.phone) {
      await sendSMS(
        req.user.phone,
        `PAYG: Your subscription has been cancelled. Coverage remains active until ${
          sub.coverageEndDate
            ? new Date(sub.coverageEndDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'end of period'
        }. You can resubscribe anytime at payg.ng`
      )
    }

    res.json({ success: true, message: 'Subscription cancelled', coverageEndDate: sub.coverageEndDate })
  } catch (err) {
    console.error('cancel subscription error:', err)
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' })
  }
})

module.exports = router
