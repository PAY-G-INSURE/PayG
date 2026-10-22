import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Bell, Users, LogOut, Settings,
  Plus, Calendar, Wallet, ChevronDown,
  Download, UserPlus, Home, X, Building2
} from 'lucide-react'
import { fadeUp, staggerContainer, transition } from '../../utils/animations'
import './Dashboard.css'

/* ── Mock data ── */
const mockMembers = [
  { id: 1, name: 'Adaeze Okonkwo', phone: '+234 801 234 5678', plan: 'Basic Health Plan', status: 'Active'  },
  { id: 2, name: 'Emeka Nwosu',    phone: '+234 802 345 6789', plan: 'Term Life Basic',   status: 'Active'  },
  { id: 3, name: 'Fatima Bello',   phone: '+234 803 456 7890', plan: 'Basic Health Plan', status: 'Pending' },
  { id: 4, name: 'Chidi Eze',      phone: '+234 804 567 8901', plan: 'Basic Health Plan', status: 'Active'  },
  { id: 5, name: 'Ngozi Adeyemi',  phone: '+234 805 678 9012', plan: 'Term Life Basic',   status: 'Failed'  },
]

const mockGroupPlans = [
  { id: 1, insurer: 'Insurer A', plan: 'Basic Health Plan', members: 38, total: '₦76,000/mo' },
  { id: 2, insurer: 'Insurer B', plan: 'Term Life Basic',   members: 15, total: '₦22,500/mo' },
]

const mockContributions = [
  { id: 1, date: 'Jun 01, 2026', plan: 'Basic Health Plan', covered: 38, amount: '₦76,000', method: 'Cooperative', status: 'Successful' },
  { id: 2, date: 'Jun 01, 2026', plan: 'Term Life Basic',   covered: 15, amount: '₦22,500', method: 'Cooperative', status: 'Successful' },
  { id: 3, date: 'May 01, 2026', plan: 'Basic Health Plan', covered: 36, amount: '₦72,000', method: 'Cooperative', status: 'Successful' },
  { id: 4, date: 'May 01, 2026', plan: 'Term Life Basic',   covered: 15, amount: '₦22,500', method: 'Cooperative', status: 'Pending'    },
]

const navItems = [
  { icon: Home,      label: 'Overview'             },
  { icon: Users,     label: 'Members'              },
  { icon: Shield,    label: 'Group Plans'          },
  { icon: Wallet,    label: 'Contributions'        },
  { icon: Building2, label: 'Organisation Profile' },
]

const statusMap = {
  Active:     'badge-success',
  Successful: 'badge-success',
  Pending:    'badge-warning',
  Failed:     'badge-error',
}

/* ── Sidebar ── */
function Sidebar({ active, setActive, navigate, mobileOpen, setMobileOpen }) {
  return (
    <>
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
        <div className="dash-sidebar__logo">
          <div className="dash-sidebar__logo-icon" style={{ background: 'var(--teal)' }}>
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <span>PayG<span>Insure</span></span>
          <button className="dash-sidebar__close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="dash-sidebar__org-badge">
          <Building2 size={14} />
          Lagos Market Cooperative
        </div>

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
                <motion.div className="dash-nav-item__indicator" layoutId="coop-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

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
            <div className="dash-topbar__avatar" style={{ background: 'var(--teal)' }}>LC</div>
            <span className="dash-topbar__name">Lagos Coop</span>
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
                <button className="dash-dropdown-item"><Building2 size={14} /> Organisation Profile</button>
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
      <motion.div className="dash-welcome" variants={fadeUp} transition={transition.smooth}>
        <div>
          <h2 className="dash-welcome__heading">Welcome back, Lagos Market Cooperative</h2>
          <p className="dash-welcome__sub">Here is your organisation's coverage summary.</p>
        </div>
      </motion.div>

      <motion.div className="dash-stats" variants={fadeUp} transition={{ ...transition.smooth, delay: .1 }}>
        {[
          { icon: Users,    label: 'Total Members',    value: '53',          color: 'var(--primary)' },
          { icon: Shield,   label: 'Active Plans',     value: '2',           color: 'var(--teal)'    },
          { icon: Calendar, label: 'Next Payment Due', value: 'Jul 1, 2026', color: 'var(--orange)'  },
          { icon: Wallet,   label: 'Total Monthly',    value: '₦98,500',     color: 'var(--success)' },
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

      <motion.div variants={fadeUp} transition={{ ...transition.smooth, delay: .3 }}>
        <h3 className="dash-section-heading">Recent Members</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Plan</th><th>Status</th></tr>
            </thead>
            <tbody>
              {mockMembers.slice(0, 3).map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.plan}</td>
                  <td><span className={`badge ${statusMap[m.status]}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Members tab ── */
function MembersTab() {
  const [search, setSearch] = useState('')
  const filtered = mockMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transition.smooth}>
      <div className="dash-members-toolbar">
        <input
          className="form-input dash-search"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '.75rem' }}>
          <button className="btn btn-outline-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <Download size={15} /> Export
          </button>
          <button className="btn btn-teal btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <UserPlus size={15} /> Add Member
          </button>
        </div>
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Plan</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.plan}</td>
                <td><span className={`badge ${statusMap[m.status]}`}>{m.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

/* ── Group Plans tab ── */
function GroupPlansTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transition.smooth}>
      <h3 className="dash-section-heading">Group Plans</h3>
      <div className="dash-plans-grid">
        {mockGroupPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            className="dash-plan-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * .1, ...transition.smooth }}
            whileHover={{ y: -4 }}
          >
            <div className="dash-plan-card__top">
              <div className="dash-plan-card__logo">{plan.insurer.slice(-1)}</div>
              <span className="badge badge-success">Active</span>
            </div>
            <h4 className="dash-plan-card__name">{plan.plan}</h4>
            <p  className="dash-plan-card__insurer">{plan.insurer}</p>
            <div className="dash-plan-card__details">
              <span className="dash-plan-card__detail"><Users size={13} /> {plan.members} members</span>
            </div>
            <div className="dash-plan-card__footer">
              <span className="dash-plan-card__price">{plan.total}</span>
              <button className="btn btn-teal btn-sm">Manage</button>
            </div>
          </motion.div>
        ))}

        <motion.button
          className="dash-plan-card dash-plan-card--add"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: mockGroupPlans.length * .1, ...transition.smooth }}
          whileHover={{ y: -4, borderColor: 'var(--orange)' }}
          whileTap={{ scale: .98 }}
        >
          <div className="dash-plan-card__add-icon"><Plus size={24} /></div>
          <p className="dash-plan-card__add-label">Add New Plan</p>
          <p className="dash-plan-card__add-sub">Browse insurers for your group</p>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Contributions tab ── */
function ContributionsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transition.smooth}>
      <h3 className="dash-section-heading">Contribution History</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th><th>Plan</th><th>Members Covered</th><th>Amount</th><th>Method</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockContributions.map(row => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.plan}</td>
                <td>{row.covered}</td>
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

/* ── Organisation Profile tab ── */
function OrgProfileTab() {
  const [form, setForm] = useState({
    orgName: 'Lagos Market Cooperative',
    regNumber: 'RC 123456',
    orgType: 'cooperative',
    contactName: 'Joshua Olufemi',
    phone: '+234 800 000 0000',
    email: 'contact@lagosmarketcoop.ng',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <motion.div
      className="dash-profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={transition.smooth}
    >
      <h3 className="dash-section-heading">Organisation Profile</h3>
      <div className="dash-profile__card">
        <div className="dash-profile__avatar" style={{ background: 'var(--teal)' }}>LC</div>
        <div className="dash-profile__form">
          <div className="form-group">
            <label className="form-label">Organisation Name</label>
            <input className="form-input" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
          </div>
          <div className="dash-profile__row">
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input className="form-input" value={form.regNumber} onChange={e => set('regNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Organisation Type</label>
              <select className="form-input form-select" value={form.orgType} onChange={e => set('orgType', e.target.value)}>
                <option value="cooperative">Cooperative</option>
                <option value="trade-union">Trade Union</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person's Name</label>
            <input className="form-input" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
          </div>
          <div className="dash-profile__row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <button className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </div>
      </div>

      <h3 className="dash-section-heading" style={{ marginTop: '2.5rem' }}>Change Password / PIN</h3>
      <div className="dash-profile__card">
        <div className="dash-profile__form">
          <div className="form-group">
            <label className="form-label">Current Password / PIN</label>
            <input className="form-input" type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password / PIN</label>
            <input className="form-input" type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password / PIN</label>
            <input className="form-input" type="password" placeholder="Repeat new password" />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function CoopDashboard() {
  const [active,     setActive    ] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const tabs = {
    Overview:               <OverviewTab />,
    Members:                <MembersTab />,
    'Group Plans':          <GroupPlansTab />,
    Contributions:          <ContributionsTab />,
    'Organisation Profile': <OrgProfileTab />,
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
