const express = require('express')
const { protect } = require('../middleware/auth')
const Subscription = require('../models/Subscription')

const router = express.Router()

router.get('/settings', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })
    if (!subscription) return res.status(404).json({ success: false, message: 'No subscription found' })
    res.json({ success: true, available: false, settings: { enabled: false, percentage: 10, network: null } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get airtime settings' })
  }
})

router.post('/settings', protect, async (req, res) => {
  try {
    if (req.body.enabled) {
      return res.status(501).json({
        success: false,
        available: false,
        message: 'Airtime deduction cannot be enabled until a carrier-approved billing integration is configured.',
      })
    }
    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      { $set: { airtimeDeduction: { enabled: false, percentage: 10, network: null, updatedAt: new Date().toISOString() } } },
      { new: true },
    )
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' })
    res.json({ success: true, available: false, message: 'Airtime deduction is unavailable and remains disabled.', settings: subscription.airtimeDeduction })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update airtime settings' })
  }
})

router.post('/deduct', protect, (req, res) => res.status(501).json({
  success: false,
  available: false,
  message: 'Wallet credits are disabled until a carrier-approved billing integration can verify the user charge.',
}))

router.post('/callback', (req, res) => res.status(410).json({ success: false, message: 'Airtime credit callbacks are not enabled.' }))

module.exports = router
