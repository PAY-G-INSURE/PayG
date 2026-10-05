const jwt = require('jsonwebtoken')

function protectAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Admin sign-in required' })
    const token = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    if (token.role !== 'admin' || token.username !== process.env.ADMIN_USERNAME) {
      return res.status(403).json({ success: false, message: 'Administrator access is required' })
    }
    req.admin = { username: token.username }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Admin session expired. Sign in again.' })
  }
}

module.exports = { protectAdmin }
