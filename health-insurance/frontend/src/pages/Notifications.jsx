import { useApp } from '../context/AppContext.jsx'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

const T = {
  s0: '#0A1F12', s1: '#102A18', s2: '#173A23',
  t4: '#65C37A', t6: '#27833D',
  ink: '#F0F6FC', muted: '#8B949E', border: '#2D4D35',
  green: '#5FBA72', orange: '#9DBB75',
}

const TYPE_CONFIG = {
  payment: { icon: 'payments',     bg: 'rgba(52,211,153,0.1)',  color: '#5FBA72' },
  coverage:{ icon: 'shield',       bg: 'rgba(101,195,122,0.1)',  color: '#65C37A' },
  claim:   { icon: 'receipt_long', bg: 'rgba(251,146,60,0.1)',  color: '#9DBB75' },
  alert:   { icon: 'warning',      bg: 'rgba(248,113,113,0.1)', color: '#F87171' },
  info:    { icon: 'info',         bg: '#173A23',               color: '#8B949E' },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `${days}d ago`
  if (hrs  > 0) return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

function NotifItem({ n, onRead, showDot, dimmed }) {
  const t = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
  return (
    <button
      onClick={() => onRead(n.id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
        background: !n.read ? 'rgba(101,195,122,0.04)' : 'transparent',
        border: 'none', fontFamily: 'inherit',
        opacity: dimmed ? 0.55 : 1,
        transition: 'background 0.18s',
      }}
      onMouseEnter={e => !dimmed && (e.currentTarget.style.background = 'rgba(101,195,122,0.07)')}
      onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(101,195,122,0.04)' : 'transparent'}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: t.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="icon" style={{ color: t.color, fontSize: 18 }}>{t.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: T.ink, margin: 0 }}>{n.title}</p>
          {showDot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.t4, flexShrink: 0 }} />}
        </div>
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.55, marginBottom: 4 }}>{n.body}</p>
        <p style={{ fontSize: 10, color: T.border, fontWeight: 600 }}>{timeAgo(n.time || n.createdAt)}</p>
      </div>
    </button>
  )
}

const sectionLabel = (text) => (
  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
    color: T.muted, marginBottom: 8, paddingLeft: 2 }}>
    {text}
  </p>
)

const notifCard = (children, { divided } = {}) => (
  <div style={{
    background: T.s1, border: `1px solid ${T.border}`,
    borderRadius: 18, overflow: 'hidden',
    ...(divided ? { display: 'flex', flexDirection: 'column' } : {}),
  }}>
    {divided
      ? children.map((child, i) => (
          <div key={i} style={{ borderBottom: i < children.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            {child}
          </div>
        ))
      : children}
  </div>
)

export default function Notifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useApp()

  const unread = notifications.filter(n => !n.read)
  const read   = notifications.filter(n => n.read)

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        right={
          unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              fontSize: 12, fontWeight: 700, color: T.t4,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Mark all read
            </button>
          )
        }
      />

      <div style={{ padding: '20px 20px 80px', maxWidth: 900 }}>

        {notifications.length === 0 ? (
          <div style={{
            background: T.s1, border: `1px solid ${T.border}`,
            borderRadius: 22, padding: '64px 24px', textAlign: 'center', marginTop: 16,
          }}>
            <span className="icon" style={{ fontSize: 48, color: T.border, display: 'block', marginBottom: 14 }}>notifications</span>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: T.ink, marginBottom: 8 }}>No notifications yet</h3>
            <p style={{ fontSize: 14, color: T.muted, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
              Payment confirmations, coverage alerts and claim updates will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>

            {/* Unread */}
            {unread.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                {sectionLabel('New')}
                <div style={{
                  background: T.s1, border: `1px solid rgba(101,195,122,0.2)`,
                  borderRadius: 18, overflow: 'hidden',
                }}>
                  {unread.map((n, i) => (
                    <div key={n.id} style={{ borderBottom: i < unread.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <NotifItem n={n} onRead={markRead} showDot={true} dimmed={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Read */}
            {read.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                {sectionLabel('Earlier')}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: unread.length === 0 ? 'repeat(auto-fit,minmax(280px,1fr))' : '1fr',
                  gap: 12,
                }}>
                  {unread.length === 0
                    ? read.map(n => (
                        <div key={n.id} style={{
                          background: T.s1, border: `1px solid ${T.border}`,
                          borderRadius: 18, overflow: 'hidden',
                        }}>
                          <NotifItem n={n} onRead={() => {}} showDot={false} dimmed={true} />
                        </div>
                      ))
                    : (
                        <div style={{
                          background: T.s1, border: `1px solid ${T.border}`,
                          borderRadius: 18, overflow: 'hidden',
                        }}>
                          {read.map((n, i) => (
                            <div key={n.id} style={{ borderBottom: i < read.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                              <NotifItem n={n} onRead={() => {}} showDot={false} dimmed={true} />
                            </div>
                          ))}
                        </div>
                      )
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* SMS notice */}
        <div style={{
          marginTop: 20, padding: '14px 16px',
          background: 'rgba(101,195,122,0.07)', border: '1px solid rgba(101,195,122,0.2)',
          borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span className="icon" style={{ color: T.t4, fontSize: 18, flexShrink: 0 }}>sms</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.t4, marginBottom: 4 }}>SMS Alerts Active</p>
            <p style={{ fontSize: 12, color: '#5EEAD4', lineHeight: 1.6 }}>
              Payment confirmations and coverage alerts are also sent to your registered phone via SMS.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}