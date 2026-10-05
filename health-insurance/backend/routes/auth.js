const express = require('express')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')

const User = require('../models/User')
const Subscription = require('../models/Subscription')
const { signToken, protect } = require('../middleware/auth')
const { sendOTP, sendWelcome } = require('../utils/sms')
const notif = require('../utils/notifications')

const router = express.Router()

// Stricter rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
})

// ─── Helper: generate 4-digit OTP ────────────────────────────────────────────
const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000))

// ─── POST /api/auth/send-otp ─────────────────────────────────────────────────
router.post(
  '/send-otp',
  otpLimiter,
  [
    body('phone')
      .optional()
      .matches(/^(\+?234|0)[789]\d{9}$/)
      .withMessage('Invalid Nigerian phone number'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { phone, email } = req.body
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required' })
    }
    if (email) return res.status(501).json({ success: false, message: 'Email verification is not available. Sign in with your phone number.' })

    try {
      // Find or create user
      const query = phone ? { phone } : { email }
      let user = await User.findOne(query)
      if (!user) {
        user = await User.create({ phone, email })
      }

      // Check OTP cooldown (prevent spamming)
      if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
        const remaining = Math.ceil((user.otpExpiresAt - new Date()) / 1000 / 60)
        // Only block if they've tried too many times
        if (user.otpAttempts >= 3) {
          return res.status(429).json({
            success: false,
            message: `Too many attempts. Try again in ${remaining} minute(s).`,
          })
        }
      }

      // Generate OTP
      const otp = generateOTP()
      const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000)

      user.otp = otp
      user.otpExpiresAt = expiresAt
      user.otpAttempts = 0
      await user.save()

      // Send OTP via SMS (phone) or log (email — wire up Nodemailer/SendGrid later)
      if (phone) {
        const sent = await sendOTP(phone, otp)
        if (!sent.success) return res.status(503).json({ success: false, message: 'Unable to send the verification code. Please try again later.' })
      } else {
        // TODO: send email OTP via Nodemailer/SendGrid
        console.log(`📧 [EMAIL OTP] To: ${email} — Code: ${otp}`)
      }

      res.json({
        success: true,
        message: `Verification code sent to ${phone || email}`,
        // Only return OTP in development for easy testing
        ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
      })
    } catch (err) {
      console.error('send-otp error:', err)
      res.status(500).json({ success: false, message: 'Failed to send verification code' })
    }
  }
)

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('otp').isLength({ min: 4, max: 4 }).isNumeric().withMessage('OTP must be 4 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { phone, email, otp } = req.body
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email required' })
    }

    try {
      const query = phone ? { phone } : { email }
      const user = await User.findOne(query)

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      if (user.otpAttempts >= 3) {
        return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new verification code.' })
      }

      // Increment attempt counter
      user.otpAttempts = (user.otpAttempts || 0) + 1
      await user.save()

      // Check expiry
      if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'Verification code has expired. Request a new one.' })
      }

      // Check OTP
      if (user.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: `Incorrect code. ${3 - user.otpAttempts} attempt(s) remaining.`,
        })
      }

      // Clear OTP fields
      user.otp = null
      user.otpExpiresAt = null
      user.otpAttempts = 0
      user.isVerified = true
      await user.save()

      // Check if user is new (no name yet = needs onboarding)
      const isNew = !user.isOnboarded

      // Ensure subscription record exists
      let subscription = await Subscription.findOne({ user: user._id })
      if (!subscription) {
        subscription = await Subscription.create({ user: user._id })
      }

      // Welcome notification for new users
      if (isNew) {
        await notif.welcome(user._id, user.firstName || 'there')
      }

      const token = signToken(user._id)

      res.json({
        success: true,
        token,
        isNew,
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isOnboarded: user.isOnboarded,
        },
      })
    } catch (err) {
      console.error('verify-otp error:', err)
      res.status(500).json({ success: false, message: 'Verification failed' })
    }
  }
)

// ─── PUT /api/auth/profile — update profile after onboarding ─────────────────
router.put(
  '/profile',
  protect,
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('kinName').notEmpty().withMessage('Next of kin name is required'),
    body('kinPhone')
      .matches(/^(\+?234|0)[789]\d{9}$/)
      .withMessage('Invalid next of kin phone number'),
    body('kinRelation').notEmpty().withMessage('Relationship is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { firstName, lastName, dateOfBirth, gender, kinName, kinPhone, kinRelation } = req.body

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName, dateOfBirth, gender, kinName, kinPhone, kinRelation, isOnboarded: true },
        { new: true, runValidators: true }
      )

      if (!user) return res.status(404).json({ success: false, message: 'User not found' })
      delete user.otp
      delete user.otpExpiresAt
      delete user.otpAttempts

      // Send welcome SMS
      if (user.phone) {
        await sendWelcome(user.phone, firstName)
      }

      res.json({ success: true, user })
    } catch (err) {
      console.error('profile update error:', err)
      res.status(500).json({ success: false, message: 'Failed to update profile' })
    }
  }
)

// ─── GET /api/auth/me — get current user ─────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

module.exports = router
