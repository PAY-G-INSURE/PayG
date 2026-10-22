const express = require('express')
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

// ─── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v')

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false })

    res.json({ success: true, notifications, unreadCount })
  } catch  {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' })
  }
})

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    )
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' })
    res.json({ success: true, notification })
  } catch  {
    res.status(500).json({ success: false, message: 'Failed to update notification' })
  }
})

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch  {
    res.status(500).json({ success: false, message: 'Failed to update notifications' })
  }
})

module.exports = router
