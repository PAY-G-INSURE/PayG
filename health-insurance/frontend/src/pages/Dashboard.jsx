import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import AppLayout from '../components/AppLayout.jsx'

const T = {
  s0: '#0A1F12', s1: '#102A18', s2: '#173A23',
  t4: '#65C37A', t6: '#27833D',
  ink: '#F0F6FC', muted: '#8B949E', border: '#2D4D35',
  green: '#5FBA72', orange: '#9DBB75',
}

const css = `
  .dash-card {
    background: ${T.s1};
    border: 1px solid ${T.border};
    border-radius: 20px;
    transition: border-color 0.2s;
  }
  .dash-card:hover { border-color: rgba(101,195,122,0.2); }
  .quick-action {
    padding: 14px 10px;
    border-radius: 14px;
    background: ${T.s2};
    border: 1px solid ${T.border};
    color: ${T.ink};
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
  }
  .quick-action:hover { border-color: ${T.t4}; background: rgba(101,195,122,0.06); color: ${T.t4}; }
  .tx-row { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid ${T.border}; }
  .tx-row:last-child { border-bottom: none; }
`

function CoverageBar({ wallet, price }) {
  const pct = price > 0 ? Math.min((wallet / price) * 100, 100) : 0
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 99,
        background: 'rgba(255,255,255,0.9)',
        width: `${pct}%`, transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    active:   { bg: 'rgba(52,211,153,0.12)', color: T.green,  dot: T.green,  label: 'Active' },
    pending:  { bg: 'rgba(251,146,60,0.12)',  color: T.orange, dot: T.orange, label: 'Pending' },
    inactive: { bg: T.s2,                     color: T.muted,  dot: T.muted,  label: 'Inactive' },
  }
  const c = cfg[status] || cfg.inactive
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700,
      padding: '4px 10px', borderRadius: 99,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, subscription, transactions, notifications } = useApp()

  const wallet    = Number(subscription.walletBalance || 0)
  const price     = Number(subscription.planPrice || 0)
  const remaining = Math.max(0, price - wallet)
  const pct       = price > 0 ? Math.min((wallet / price) * 100, 100) : 0
  const unread    = notifications.filter(n => !n.read).length

  const daysLeft = subscription.coverageUntil
    ? Math.max(0, Math.ceil((new Date(subscription.coverageUntil).getTime() - Date.now()) / 86400000))
    : 0

  const formatDate = d => d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : ''

  return (
    <AppLayout>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{
        background: T.s0, padding: '48px 24px 20px',
        borderBottom: `1px solid ${T.border}`,
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>Good day 👋</p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', letterSpacing: -1, color: T.ink }}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome back'}
            </h1>
          </div>
          <button onClick={() => navigate('/notifications')} style={{
            position: 'relative', width: 42, height: 42,
            background: T.s2, border: `1px solid ${T.border}`,
            borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <span className="icon-o" style={{ color: T.ink, fontSize: 22 }}>notifications</span>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                width: 18, height: 18, background: T.orange,
                borderRadius: '50%', color: '#fff',
                fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${T.s0}`,
              }}>{unread}</span>
            )}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '24px 20px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>

          {/* WALLET CARD — full width, teal gradient with glow bloom */}
          <div style={{
            gridColumn: '1 / -1',
            background: `var(--t6)`,
            borderRadius: 22, padding: 28,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* signature glow bloom */}
            <div style={{
              position: 'absolute', top: -80, right: -60,
              width: 320, height: 320,
              background: 'none',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 6 }}>Insurance Wallet</p>
                  <p style={{ fontWeight: 900, fontSize: 'clamp(36px,6vw,52px)', color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
                    ₦{wallet.toLocaleString()}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
                    of ₦{price.toLocaleString()} monthly target
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4 }}>Policy</p>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{subscription.policyNumber}</p>
                  <div style={{ marginTop: 8 }}>
                    <StatusBadge status={subscription.status} />
                  </div>
                </div>
              </div>
              <CoverageBar wallet={wallet} price={price} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {remaining > 0
                    ? `₦${remaining.toLocaleString()} more to fully fund`
                    : '🎉 Fully funded for this month!'}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>{pct.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* PLAN CARD */}
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.muted }}>
                Current Plan
              </p>
              <button onClick={() => navigate('/plans')} style={{
                fontSize: 12, fontWeight: 700, color: T.t4,
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                Change
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: 'var(--t6)',
                border: '1px solid rgba(101,195,122,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="icon" style={{ color: T.t4, fontSize: 22 }}>shield</span>
              </div>
              <div>
                <p style={{ fontWeight: 900, fontSize: 18, color: T.ink }}>{subscription.plan}</p>
                <p style={{ fontSize: 13, color: T.muted }}>₦{price.toLocaleString()} / month</p>
              </div>
            </div>
            {daysLeft > 0 && (
              <p style={{ fontSize: 13, color: T.muted }}>
                Coverage active for <span style={{ fontWeight: 700, color: T.ink }}>{daysLeft} days</span>
              </p>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="dash-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.muted, marginBottom: 16 }}>
              Quick Actions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Top Up',     path: '/payment', icon: 'add_card' },
                { label: 'File Claim', path: '/claims',  icon: 'receipt_long' },
                { label: 'My Plans',   path: '/plans',   icon: 'shield' },
                { label: 'Profile',    path: '/profile', icon: 'person' },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)} className="quick-action">
                  <span className="icon-o" style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="dash-card" style={{ gridColumn: '1 / -1', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.muted }}>
                Recent Payments
              </p>
              <button onClick={() => navigate('/payment')} style={{
                fontSize: 12, fontWeight: 700, color: T.t4, background: 'none', border: 'none', cursor: 'pointer',
              }}>
                View all
              </button>
            </div>
            {transactions.length === 0 ? (
              <p style={{ padding: '0 20px 20px', fontSize: 13, color: T.muted }}>No transactions yet</p>
            ) : (
              transactions.slice(0, 3).map(tx => (
                <div key={tx.id} className="tx-row">
                  <div style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="icon" style={{ color: T.green, fontSize: 18 }}>payments</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{tx.type}</p>
                    <p style={{ fontSize: 11, color: T.muted }}>{formatDate(tx.date)}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 15, color: T.green }}>
                    +₦{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}