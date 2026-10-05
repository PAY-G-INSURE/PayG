import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Bell, User, LogOut, Settings,
  Plus, BarChart3, Calendar, ChevronDown,
  CreditCard, FileText, Home, X
} from 'lucide-react'
import { fadeUp, staggerContainer, transition } from '../../utils/animations'
import './Dashboard.css'

/* ── Mock data ── */
const mockPlans = [
  {
    id: 1, insurer: 'Insurer A', plan: 'Basic Health Plan',
    method: 'Cooperative Contribution', status: 'Active',
    premium: '₦2,000/mo', coverage: 'Health Insurance',
  },
  {
    id: 2, insurer: 'Insurer B', plan: 'Term Life Basic',
    method: 'Online payment', status: 'Active',
    premium: '₦1,500/mo', coverage: 'Life Insurance',
  },
]

const mockHistory = [
  { id: 1, date: 'Jun 01, 2026', plan: 'Basic Health Plan',   amount: '₦2,000', method: 'Cooperative', status: 'Successful' },
  { id: 2, date: 'May 15, 2026', plan: 'Term Life Basic',    amount: '₦1,500', method: 'Online payment', status: 'Successful' },
  { id: 3, date: 'May 01, 2026', plan: 'Basic Health Plan',   amount: '₦2,000', method: 'Cooperative', status: 'Successful' },
  { id: 4, date: 'Apr 20, 2026', plan: 'Term Life Basic',    amount: '₦1,500', method: 'Online payment', status: 'Pending'    },
  { id: 5, date: 'Apr 01, 2026', plan: 'Basic Health Plan',   amount: '₦2,000', method: 'Cooperative', status: 'Failed'     },
]

const navItems = [
  { icon: Home,       label: 'Overview'        },
  { icon: Shield,     label: 'My Plans'        },
  { icon: CreditCard, label: 'Payment History' },
  { icon: User,       label: 'Profile'         },
]

const statusMap = {
  Successful: 'badge-success',
  Pending:    'badge-warning',
  Failed:     'badge-error',
}

/* ── Sidebar ── */
function Sidebar({ active, setActive, navigate, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="dash-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`dash-sidebar ${mobileOpen ? 'dash-sidebar--open' : ''}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={transition.smooth}
      >
        {/* Logo */}
        <div className="dash-sidebar__logo">
          <div className="dash-sidebar__logo-icon"><Shield size={18} strokeWidth={2.5} /></div>
          <span>PayG<span>Insure</span></span>
          <button className="dash-sidebar__close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="dash-sidebar__nav">
          {navItems.map(item => (
            <button
              key={item.label}
              className={`dash-nav-item ${active === item.label ? 'dash-nav-item--active' : ''}`}
              onClick={() => { setActive(item.label); setMobileOpen(false) }}
            >
              <item.icon size={18} strokeWidth={1.75} />
              {item.label}
              {active === item.label && (
                <motion.div className="dash-nav-item__indicator" layoutId="nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="dash-sidebar__bottom">
          <button className="dash-nav-item" onClick={() => navigate('/')}>
            <LogOut size={18} strokeWidth={1.75} /> Log Out
          </button>
        </div>
      </motion.aside>
    </>
  )
}

/* ── Top bar ── */
function Topbar({ active, setMobileOpen }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="dash-topbar">
      <div className="dash-topbar__left">
        <button className="dash-topbar__hamburger" onClick={() => setMobileOpen(v => !v)}>
          <div /><div /><div />
        </button>
        <h1 className="dash-topbar__title">{active}</h1>
      </div>
      <div className="dash-topbar__right">
        <motion.button className="dash-topbar__icon-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: .95 }}>
          <Bell size={18} />
          <span className="dash-topbar__badge" />
        </motion.button>
        <div style={{ position: 'relative' }}>
          <motion.button
            className="dash-topbar__profile"
            onClick={() => setProfileOpen(v => !v)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="dash-topbar__avatar">JO</div>
            <span className="dash-topbar__name">Joshua O.</span>
            <ChevronDown size={14} />
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="dash-topbar__dropdown"
                initial={{ opacity: 0, y: 8, scale: .95 }}
                animate={{ opacity: 1, y: 0, scale: 1   }}
                exit={{   opacity: 0, y: 8, scale: .95  }}
                transition={{ duration: .2 }}
              >
                <button className="dash-dropdown-item"><User size={14} /> Profile</button>
                <button className="dash-dropdown-item"><Settings size={14} /> Settings</button>
                <div className="dash-dropdown-divider" />
                <button className="dash-dropdown-item dash-dropdown-item--danger"><LogOut size={14} /> Log Out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

/* ── Overview tab ── */
function OverviewTab() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div className="dash-welcome" variants={fadeUp} transition={transition.smooth}>
        <div>
          <h2 className="dash-welcome__heading">Welcome back, Joshua</h2>
          <p className="dash-welcome__sub">Here is a summary of your coverage.</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="dash-stats" variants={fadeUp} transition={{ ...transition.smooth, delay: .1 }}>
        {[
          { icon: Shield,    label: 'Active Plans',      value: '2',           color: 'var(--primary)' },
          { icon: Calendar,  label: 'Next Payment Due',  value: 'Jul 1, 2026', color: 'var(--teal)'    },
          { icon: BarChart3, label: 'Total Coverage',    value: '₦2.5M',       color: 'var(--orange)'  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="dash-stat-card"
            style={{ '--accent': s.color }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * .1 + .2, ...transition.smooth }}
            whileHover={{ y: -4 }}
          >
            <div className="dash-stat-card__icon" style={{ background: s.color }}>
              <s.icon size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="dash-stat-card__value">{s.value}</p>
              <p className="dash-stat-card__label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={fadeUp} transition={{ ...transition.smooth, delay: .3 }}>
        <h3 className="dash-section-heading">Recent Activity</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.slice(0, 3).map(row => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.plan}</td>
                  <td style={{ fontWeight: 600 }}>{row.amount}</td>
                  <td>{row.method}</td>
                  <td><span className={`badge ${statusMap[row.status]}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── My Plans tab ── */
function PlansTab() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div className="dash-plans-header" variants={fadeUp} transition={transition.smooth}>
        <h3 className="dash-section-heading" style={{ margin: 0 }}>My Active Plans</h3>
      </motion.div>

      <div className="dash-plans-grid">
        {mockPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            className="dash-plan-card"
            variants={fadeUp}
            transition={{ ...transition.smooth, delay: i * .1 }}
            whileHover={{ y: -4 }}
          >
            <div className="dash-plan-card__top">
              <div className="dash-plan-card__logo">
                {plan.insurer.slice(-1)}
              </div>
              <span className={`badge ${statusMap[plan.status]}`}>{plan.status}</span>
            </div>
            <h4 className="dash-plan-card__name">{plan.plan}</h4>
            <p  className="dash-plan-card__insurer">{plan.insurer}</p>
            <div className="dash-plan-card__details">
              <span className="dash-plan-card__detail">
                <CreditCard size={13} /> {plan.method}
              </span>
              <span className="dash-plan-card__detail">
                <Shield size={13} /> {plan.coverage}
              </span>
            </div>
            <div className="dash-plan-card__footer">
              <span className="dash-plan-card__price">{plan.premium}</span>
              <button className="btn btn-teal btn-sm">Manage</button>
            </div>
          </motion.div>
        ))}

        {/* Add new plan card */}
        <motion.button
          className="dash-plan-card dash-plan-card--add"
          variants={fadeUp}
          transition={{ ...transition.smooth, delay: mockPlans.length * .1 }}
          whileHover={{ y: -4, borderColor: 'var(--orange)' }}
          whileTap={{ scale: .98 }}
        >
          <div className="dash-plan-card__add-icon">
            <Plus size={24} />
          </div>
          <p className="dash-plan-card__add-label">Add New Plan</p>
          <p className="dash-plan-card__add-sub">Browse more insurers and plans</p>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Payment History tab ── */
function PaymentHistoryTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transition.smooth}>
      <h3 className="dash-section-heading">Payment History</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map(row => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.plan}</td>
                <td style={{ fontWeight: 600 }}>{row.amount}</td>
                <td>{row.method}</td>
                <td><span className={`badge ${statusMap[row.status]}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

/* ── Profile tab ── */
function ProfileTab() {
  const [form, setForm] = useState({
    firstName: 'Joshua', lastName: 'Olufemi',
    phone: '+234 800 000 0000', email: 'joshua@example.com',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <motion.div
      className="dash-profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={transition.smooth}
    >
      <h3 className="dash-section-heading">My Profile</h3>
      <div className="dash-profile__card">
        <div className="dash-profile__avatar">JO</div>
        <div className="dash-profile__form">
          <div className="dash-profile__row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <button className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </div>
      </div>

      <h3 className="dash-section-heading" style={{ marginTop: '2.5rem' }}>Change Password</h3>
      <div className="dash-profile__card">
        <div className="dash-profile__form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" placeholder="Repeat new password" />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function IndividualDashboard() {
  const [active,     setActive    ] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const tabs = {
    Overview:         <OverviewTab />,
    'My Plans':       <PlansTab />,
    'Payment History': <PaymentHistoryTab />,
    Profile:          <ProfileTab />,
  }

  return (
    <div className="dashboard">
      <Sidebar
        active={active} setActive={setActive}
        navigate={navigate}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />
      <div className="dash-main">
        <Topbar active={active} setMobileOpen={setMobileOpen} />
        <main className="dash-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -8  }}
              transition={transition.smooth}
            >
              {tabs[active]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
