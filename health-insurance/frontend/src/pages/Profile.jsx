import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

/*
  CSS custom properties — same token set as Dashboard.jsx and Onboarding.jsx.
  Injected once via <style> so every component in this file shares the palette.
*/
const CSS_VARS = `
  :root {
    --surface-0:  #0A1F12;
    --surface-1:  #102A18;
    --surface-2:  #173A23;
    --teal-400:   #65C37A;
    --teal-600:   #27833D;
    --teal-glow:  rgba(101,195,122,0.15);
    --ink:        #F0F6FC;
    --ink-muted:  #8B949E;
    --border:     #2D4D35;
    --green:      #5FBA72;
    --green-dim:  rgba(52,211,153,0.12);
    --orange:     #9DBB75;
    --orange-dim: rgba(251,146,60,0.12);
  }
`

/* ─── small helpers ─────────────────────────────────────── */
function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] w-full lg:max-w-lg rounded-t-4xl lg:rounded-3xl p-6 scale-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5 lg:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-extrabold text-xl text-[var(--ink)]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[var(--surface-2)] rounded-full flex items-center justify-center"
          >
            <span className="icon-o text-[var(--ink-muted)] text-xl">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, editing, name, type = 'text', options, onChange }) {
  const inputClass =
    'w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl px-4 py-3 text-sm font-display text-[var(--ink)] focus:outline-none focus:border-[var(--teal-400)] transition-colors'

  if (editing && options) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-display font-semibold text-[var(--ink-muted)] mb-1.5">{label}</label>
        <select name={name} value={value} onChange={onChange} className={inputClass}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  if (editing) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-display font-semibold text-[var(--ink-muted)] mb-1.5">{label}</label>
        <input name={name} type={type} value={value} onChange={onChange} className={inputClass} />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <p className="text-xs font-display font-semibold text-[var(--ink-muted)]">{label}</p>
      <p className="text-sm font-display font-semibold text-[var(--ink)]">{value || '—'}</p>
    </div>
  )
}

/* ─── Shared modal CTA buttons ──────────────────────────── */
const btnPrimary  = 'flex-1 bg-[var(--t6)] text-[var(--surface-0)] font-display font-bold py-4 rounded-3xl hover:opacity-90 active:scale-95 transition-all'
const btnSecondary = 'flex-1 bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold py-4 rounded-3xl hover:bg-[var(--border)] active:scale-95 transition-all'

/* ─── Personal Details modal ────────────────────────────── */
function PersonalDetailsModal({ open, onClose, user, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    dob:       user?.dob       || '',
    gender:    user?.gender    || '',
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleSave   = () => { onSave(form); setEditing(false) }
  const handleClose  = () => { setEditing(false); onClose() }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Personal Details">
      <Field label="First Name"    value={form.firstName} editing={editing} name="firstName" onChange={handleChange} />
      <Field label="Last Name"     value={form.lastName}  editing={editing} name="lastName"  onChange={handleChange} />
      <Field label="Date of Birth" value={form.dob}       editing={editing} name="dob"       type="date" onChange={handleChange} />
      <Field label="Gender"        value={form.gender}    editing={editing} name="gender"
        options={['Male', 'Female', 'Prefer not to say']} onChange={handleChange} />

      {editing ? (
        <div className="flex gap-3 mt-6">
          <button onClick={() => setEditing(false)} className={btnSecondary}>Cancel</button>
          <button onClick={handleSave}              className={btnPrimary}>Save Changes</button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`w-full mt-6 flex items-center justify-center gap-2 ${btnPrimary}`}
        >
          <span className="icon-o text-xl">edit</span>
          Edit Details
        </button>
      )}
    </BottomSheet>
  )
}

/* ─── Next of Kin modal ─────────────────────────────────── */
function NextOfKinModal({ open, onClose, user, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    kinName:         user?.kinName         || '',
    kinPhone:        user?.kinPhone        || '',
    kinRelationship: user?.kinRelationship || '',
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleSave   = () => { onSave(form); setEditing(false) }
  const handleClose  = () => { setEditing(false); onClose() }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Next of Kin">
      {/* Info banner */}
      <div className="bg-[var(--teal-glow)] rounded-2xl px-4 py-3 flex gap-3 mb-5">
        <span className="icon text-[var(--teal-400)] text-xl flex-shrink-0">info</span>
        <p className="text-xs text-[var(--teal-400)] font-display">
          Required by Nigerian insurance regulations. This person will be contacted in case of an emergency.
        </p>
      </div>

      <Field label="Full Name"    value={form.kinName}         editing={editing} name="kinName"         onChange={handleChange} />
      <Field label="Phone Number" value={form.kinPhone}        editing={editing} name="kinPhone"        type="tel" onChange={handleChange} />
      <Field label="Relationship" value={form.kinRelationship} editing={editing} name="kinRelationship"
        options={['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']} onChange={handleChange} />

      {editing ? (
        <div className="flex gap-3 mt-6">
          <button onClick={() => setEditing(false)} className={btnSecondary}>Cancel</button>
          <button onClick={handleSave}              className={btnPrimary}>Save Changes</button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`w-full mt-6 flex items-center justify-center gap-2 ${btnPrimary}`}
        >
          <span className="icon-o text-xl">edit</span>
          Edit Next of Kin
        </button>
      )}
    </BottomSheet>
  )
}

/* ─── Transaction History modal ─────────────────────────── */
const STATUS_STYLE = {
  success: { bg: 'var(--green-dim)',  text: 'var(--green)' },
  pending: { bg: 'var(--orange-dim)', text: 'var(--orange)' },
  failed:  { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
}

function TransactionHistoryModal({ open, onClose, transactions }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Transaction History">
      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <span className="icon-o text-[var(--ink-muted)] text-5xl">receipt_long</span>
          <p className="font-display font-semibold text-[var(--ink)] mt-3">No transactions yet</p>
          <p className="text-sm text-[var(--ink-muted)] mt-1">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {transactions.map((tx, i) => {
            const s = STATUS_STYLE[tx.status] || STATUS_STYLE.success
            return (
              <div
                key={tx.id || i}
                className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div style={{ background: 'var(--green-dim)' }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="icon text-xl" style={{ color: 'var(--green)' }}>payments</span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[var(--ink)] text-sm">
                      {tx.description || 'Wallet Top-up'}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">
                      {tx.date ? new Date(tx.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-[var(--ink)] text-sm">
                    +₦{Number(tx.amount).toLocaleString()}
                  </p>
                  <span
                    className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.text }}
                  >
                    {tx.status || 'Success'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}

/* ─── Help & Support modal ──────────────────────────────── */
const FAQS = [
  {
    q: 'How does the wallet work?',
    a: "Top up any amount at any time. Once your wallet reaches your plan's monthly price, coverage activates automatically.",
  },
  {
    q: 'What happens if my wallet runs out?',
    a: 'You get a 7-day grace period to top up before coverage pauses. Your plan and policy number are always kept safe.',
  },
  {
    q: 'How do I file a claim?',
    a: 'Go to the Claims tab, tap "New Claim", fill in your hospital details and amount, and submit. Claims are reviewed within 3 working days.',
  },
  {
    q: 'Which hospitals can I use?',
    a: 'Any registered partner hospital. Show your policy number at the reception. A full directory is coming soon in-app.',
  },
  {
    q: 'Can I fund my wallet with mobile airtime?',
    a: 'Airtime billing is not currently available. Fund your wallet through the Paystack payment option in the app.',
  },
]

function HelpModal({ open, onClose }) {
  const [openFaq, setOpenFaq] = useState(null)
  const [copied, setCopied]   = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('support@payg.ng')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Help & Support">

      {/* Contact strip */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="tel:+2348001234567"
          className="bg-[var(--teal-glow)] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition-colors"
        >
          <span className="icon text-[var(--teal-400)] text-2xl">call</span>
          <p className="font-display font-bold text-[var(--teal-400)] text-xs text-center">Call Us</p>
          <p className="font-display text-[var(--teal-400)] text-[10px] text-center">0800 123 4567</p>
        </a>
        <button
          onClick={copyEmail}
          className="bg-[var(--surface-2)] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[var(--border)] transition-colors"
        >
          <span className="icon-o text-[var(--ink)] text-2xl">mail</span>
          <p className="font-display font-bold text-[var(--ink)] text-xs text-center">
            {copied ? 'Copied!' : 'Email Us'}
          </p>
          <p className="font-display text-[var(--ink-muted)] text-[10px] text-center">support@payg.ng</p>
        </button>
      </div>

      {/* FAQs */}
      <p className="font-display font-bold text-[var(--ink)] text-sm mb-3">Frequently Asked Questions</p>
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-[var(--border)] last:border-0">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-[var(--surface-2)] transition-colors"
            >
              <p className="font-display font-semibold text-[var(--ink)] text-sm pr-4">{faq.q}</p>
              <span className={`icon-o text-[var(--ink-muted)] text-xl flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Response time note */}
      <div className="mt-4 rounded-2xl px-4 py-3 flex gap-3" style={{ background: 'var(--orange-dim)' }}>
        <span className="icon text-xl flex-shrink-0" style={{ color: 'var(--orange)' }}>schedule</span>
        <p className="text-xs font-display" style={{ color: 'var(--orange)' }}>
          We typically respond within <strong>24 hours</strong> on business days (Mon–Fri, 8am–6pm WAT).
        </p>
      </div>
    </BottomSheet>
  )
}

/* ─── Main Profile page ─────────────────────────────────── */
export default function Profile() {
  const { user, subscription, transactions, logout, updateUser } = useApp()
  const navigate = useNavigate()

  const [showLogout,    setShowLogout]    = useState(false)
  const [showPersonal,  setShowPersonal]  = useState(false)
  const [showKin,       setShowKin]       = useState(false)
  const [showTxHistory, setShowTxHistory] = useState(false)
  const [showHelp,      setShowHelp]      = useState(false)
  const [copied,        setCopied]        = useState(false)

  const handleLogout       = () => { logout(); navigate('/') }
  const handleSavePersonal = data => { if (typeof updateUser === 'function') updateUser(data) }
  const handleSaveKin      = data => { if (typeof updateUser === 'function') updateUser(data) }

  const copyPolicy = () => {
    navigator.clipboard.writeText(subscription.policyNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const menuItems = [
    { icon: 'person',         label: 'Personal Details',     sub: 'Name, DOB, gender',                                                              action: () => setShowPersonal(true) },
    { icon: 'family_restroom',label: 'Next of Kin',          sub: 'Emergency contact',                                                              action: () => setShowKin(true) },
    { icon: 'shield',         label: 'My Plan',              sub: `${subscription.plan} — ₦${subscription.planPrice.toLocaleString()}/mo`,           action: () => navigate('/plans') },
    { icon: 'receipt_long',   label: 'Transaction History',  sub: `${(transactions || []).length} payment${(transactions || []).length !== 1 ? 's' : ''}`, action: () => setShowTxHistory(true) },
    { icon: 'notifications',  label: 'Notifications',        sub: 'SMS & in-app alerts',                                                            action: () => navigate('/notifications') },
    { icon: 'help',           label: 'Help & Support',       sub: 'FAQs, contact us',                                                               action: () => setShowHelp(true) },
    { icon: 'description',    label: 'Terms of Service',     sub: null,                                                                              action: () => navigate('/terms') },
    { icon: 'privacy_tip',    label: 'Privacy Policy',       sub: null,                                                                              action: () => navigate('/privacy') },
  ]

  return (
    <AppLayout>
      <style>{CSS_VARS}</style>
      <PageHeader title="Profile" back={false} />

      <div className="px-4 lg:px-8 pt-5 pb-28 lg:pb-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">

            {/* Profile hero card */}
            <div
              className="rounded-3xl p-6 relative overflow-hidden"
              style={{ background: 'var(--t6)' }}
            >
              {/* glow bloom */}
              <div style={{
                position: 'absolute', top: -80, right: -60,
                width: 280, height: 280,
                background: 'none',
                pointerEvents: 'none',
              }} />
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="icon text-white text-3xl">person</span>
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-white text-xl">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : 'PAYG User'}
                    </h2>
                    <p className="text-white/60 text-sm font-display">{user?.phone || user?.email || '+234 — — — —'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                      <span className="text-[var(--green)] text-xs font-display font-bold">
                        {subscription.status === 'active' ? 'Active Member' : 'Member'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-[10px] font-display font-semibold">Policy Number</p>
                    <p className="text-white font-display font-bold text-sm tracking-wide">{subscription.policyNumber}</p>
                  </div>
                  <button onClick={copyPolicy} className="text-white/50 hover:text-white transition-colors">
                    <span className="icon-o text-xl">{copied ? 'check_circle' : 'content_copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plan card */}
            <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-display font-bold text-[var(--ink-muted)] uppercase tracking-wider">Current Plan</p>
                <button
                  onClick={() => navigate('/plans')}
                  className="text-xs text-[var(--teal-400)] font-display font-bold hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--teal-glow)', border: '1px solid rgba(101,195,122,0.2)' }}
                  >
                    <span className="icon text-[var(--teal-400)] text-xl">health_and_safety</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-[var(--ink)]">{subscription.plan}</p>
                    <p className="text-xs text-[var(--ink-muted)]">₦{subscription.planPrice.toLocaleString()}/month</p>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-bold"
                  style={subscription.status === 'active'
                    ? { background: 'var(--green-dim)', color: 'var(--green)' }
                    : { background: 'var(--orange-dim)', color: 'var(--orange)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: subscription.status === 'active' ? 'var(--green)' : 'var(--orange)' }}
                  />
                  {subscription.status === 'active' ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-[var(--ink-muted)] font-display">
              PAYG v2.0.0 · © 2026 PayGo Technologies Ltd.
            </p>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Menu list */}
            <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl overflow-hidden">
              {menuItems.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer ${
                    i < menuItems.length - 1 ? 'border-b border-[var(--border)]' : ''
                  }`}
                >
                  <div className="w-9 h-9 bg-[var(--surface-2)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="icon-o text-[var(--ink-muted)] text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[var(--ink)] text-sm">{item.label}</p>
                    {item.sub && <p className="text-xs text-[var(--ink-muted)] truncate">{item.sub}</p>}
                  </div>
                  <span className="icon-o text-[var(--ink-muted)] text-xl">chevron_right</span>
                </button>
              ))}
            </div>

            {/* Sign out */}
            <button
              onClick={() => setShowLogout(true)}
              className="w-full border-2 border-[var(--border)] text-red-500 font-display font-semibold py-4 rounded-3xl hover:bg-red-500/5 hover:border-red-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="icon-o text-xl">logout</span>
              Sign Out
            </button>
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <PersonalDetailsModal
        open={showPersonal}
        onClose={() => setShowPersonal(false)}
        user={user}
        onSave={handleSavePersonal}
      />
      <NextOfKinModal
        open={showKin}
        onClose={() => setShowKin(false)}
        user={user}
        onSave={handleSaveKin}
      />
      <TransactionHistoryModal
        open={showTxHistory}
        onClose={() => setShowTxHistory(false)}
        transactions={transactions || []}
      />
      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Logout confirm sheet */}
      {showLogout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6"
          onClick={() => setShowLogout(false)}
        >
          <div
            className="bg-[var(--surface-1)] w-full lg:max-w-sm rounded-t-4xl lg:rounded-3xl p-6 scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5 lg:hidden" />
            <h3 className="font-display font-extrabold text-xl text-[var(--ink)] text-center mb-2">Sign Out?</h3>
            <p className="text-sm text-[var(--ink-muted)] text-center mb-6">
              You'll need to verify your phone number to sign back in.
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white font-display font-bold py-4 rounded-3xl mb-3 hover:bg-red-600 active:scale-95 transition-all"
            >
              Yes, Sign Out
            </button>
            <button
              onClick={() => setShowLogout(false)}
              className="w-full bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold py-4 rounded-3xl hover:bg-[var(--border)] active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
