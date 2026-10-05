const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()
const { db } = require('./utils/db')

const authRoutes = require('./routes/auth')
const subscriptionRoutes = require('./routes/subscription')
const paymentRoutes = require('./routes/payments')
const claimRoutes = require('./routes/claims')
const notificationRoutes = require('./routes/notifications')
const ussdRoutes = require('./routes/ussd')
const airtimeRoutes = require('./routes/airtime')
const adminRoutes = require('./routes/admin')

const app = express()
app.use(helmet())
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5174').split(',').map(value => value.trim()),
  credentials: true,
}))

// The webhook signature is calculated over the unparsed request bytes.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') {
  // Do not log query strings: the USSD callback token is passed as a query parameter.
  morgan.token('safe-url', req => req.originalUrl.split('?')[0])
  app.use(morgan(':method :safe-url :status :response-time ms'))
}
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}))

app.get('/health', async (req, res) => {
  try {
    await db.health()
    res.json({ status: 'ok', service: 'PAYG API', version: '2.0.0', timestamp: new Date().toISOString(), db: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'unavailable', service: 'PAYG API', timestamp: new Date().toISOString(), db: 'unavailable', message: error.message })
  }
})

app.use('/api/ussd', ussdRoutes)
app.use('/api/airtime', airtimeRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/claims', claimRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }))
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
})

const PORT = process.env.PORT || 5000
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.JWT_SECRET) {
    console.error('Missing required configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET are required')
    process.exit(1)
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`PAYG API listening on port ${PORT}`))
}

module.exports = app
