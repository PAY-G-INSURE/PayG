const express = require('express')
const { body, validationResult } = require('express-validator')

const Claim = require('../models/Claim')
const Subscription = require('../models/Subscription')
const { protect } = require('../middleware/auth')
const notif = require('../utils/notifications')
const { sendClaimSubmitted } = require('../utils/sms')

const router = express.Router()

router.use(protect)

// ─── GET /api/claims ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v')

    res.json({ success: true, claims })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch claims' })
  }
})

// ─── POST /api/claims ─────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('type')
      .isIn(['Outpatient', 'Inpatient', 'Emergency', 'Pharmacy', 'Laboratory', 'Dental', 'Optical'])
      .withMessage('Invalid claim type'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('hospital').notEmpty().trim().withMessage('Hospital name is required'),
    body('treatmentDate').isISO8601().withMessage('Invalid treatment date'),
    body('amountClaimed').isInt({ min: 100 }).withMessage('Amount must be at least ₦100'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      // Check subscription is active
      const sub = await Subscription.findOne({ user: req.user._id })
      if (!sub || sub.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Claims can only be submitted with an active subscription. Please top up your wallet.',
        })
      }

      // Check treatment date is within 90 days
      const treatmentDate = new Date(req.body.treatmentDate)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      if (treatmentDate < ninetyDaysAgo) {
        return res.status(400).json({
          success: false,
          message: 'Claims must be submitted within 90 days of treatment.',
        })
      }

      const claim = await Claim.create({
        user: req.user._id,
        type: req.body.type,
        description: req.body.description,
        hospital: req.body.hospital,
        treatmentDate,
        amountClaimed: req.body.amountClaimed,
      })

      // Notifications
      await notif.claimSubmitted(req.user._id, claim.ref)

      if (req.user.phone) {
        await sendClaimSubmitted(req.user.phone, claim.ref)
      }

      res.status(201).json({
        success: true,
        message: 'Claim submitted successfully',
        claim,
      })
    } catch (err) {
      console.error('submit claim error:', err)
      res.status(500).json({ success: false, message: 'Failed to submit claim' })
    }
  }
)

// ─── GET /api/claims/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, user: req.user._id })
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' })
    res.json({ success: true, claim })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch claim' })
  }
})

module.exports = router
