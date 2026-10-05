import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import logo from '../assets/logo.png'

/*
  CSS custom properties — same token set as Dashboard, Onboarding, and Profile.
  Injected once at the layout level so all child components inherit the palette.
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

/* ─── Shared Tabs (single source of truth) ─────────────────────────────── */
const tabs = [
  { path: '/dashboard', icon: 'grid_view',     label: 'Home'    },
  { path: '/plans',     icon: 'shield',        label: 'Plans'   },
  { path: '/payment',   icon: 'add_card',      label: 'Pay'     },
  { path: '/claims',    icon: 'receipt_long',  label: 'Claims'  },
  { path: '/profile',   icon: 'person',        label: 'Profile' },
]

/* ─── Shared helper ─────────────────────────────────────────────────────── */
const isActive = (pathname, path) =>
  pathname === path || pathname.startsWith(path + '/')

/* ───────────────── MOBILE BOTTOM NAV ──────────────────────────────────── */
export function BottomNav() {
  const { pathname } = useLocation()
  const { unreadCount } = useApp()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}
    >
      <div className="flex justify-around items-center px-1 pt-2 pb-3">
        {tabs.map(t => {
          const active = isActive(pathname, t.path)
          return (
            <Link
              key={t.path}
              to={t.path}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all"
              style={{ color: active ? 'var(--teal-400)' : 'var(--ink-muted)' }}
            >
              {/* Badge */}
              {t.path === '/dashboard' && unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 right-1 w-4 h-4 rounded-full text-white text-[9px] font-display font-bold flex items-center justify-center"
                  style={{ background: 'var(--orange)' }}
                >
                  {unreadCount}
                </span>
              )}

              <span className={`text-[22px] ${active ? 'icon' : 'icon-o'}`}>
                {t.icon}
              </span>

              <span className="text-[10px] font-display font-semibold">
                {t.label}
              </span>

              {active && (
                <span
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: 'var(--teal-400)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ───────────────── DESKTOP SIDEBAR ────────────────────────────────────── */
export function Sidebar() {
  const { pathname } = useLocation()
  const { unreadCount, subscription } = useApp()

  return (
    <aside
      className="hidden md:flex flex-col w-20 lg:w-64 min-h-screen fixed left-0 top-0 bottom-0 z-40"
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(101,195,122,0.25)]"
            style={{ background: 'var(--t6)' }}
          >
            <span className="icon text-[var(--surface-0)] text-base font-bold">shield</span>
          </div>
          <div className="hidden lg:block">
            <span className="font-display font-extrabold text-xl" style={{ color: 'var(--ink)' }}>PAYG</span>
            <p className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>Insurance Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {tabs.map(t => {
          const active = isActive(pathname, t.path)
          return (
            <Link
              key={t.path}
              to={t.path}
              className="relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all"
              style={active
                ? { background: 'var(--teal-glow)', color: 'var(--teal-400)' }
                : { color: 'var(--ink-muted)' }
              }
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--ink-muted)' } }}
            >
              {/* Badge */}
              {t.path === '/dashboard' && unreadCount > 0 && (
                <span
                  className="absolute top-2 left-8 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--orange)' }}
                >
                  {unreadCount}
                </span>
              )}

              <span className={`text-2xl flex-shrink-0 ${active ? 'icon' : 'icon-o'}`}>
                {t.icon}
              </span>

              <span className="font-display font-semibold text-sm hidden lg:block">
                {t.label}
              </span>

              {active && (
                <span
                  className="ml-auto w-1.5 h-6 rounded-full hidden lg:block"
                  style={{ background: 'var(--teal-400)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan summary */}
      <div className="px-4 pb-6 hidden lg:block">
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
          <p
            className="text-[10px] font-bold uppercase mb-2"
            style={{ color: 'var(--ink-muted)' }}
          >
            Current Plan
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                {subscription?.plan || 'Standard'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>
                ₦{(subscription?.planPrice || 1000).toLocaleString()}/mo
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={subscription?.status === 'active'
                ? { background: 'var(--green-dim)', color: 'var(--green)' }
                : { background: 'var(--orange-dim)', color: 'var(--orange)' }
              }
            >
              {subscription?.status === 'active' ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>

        <p className="text-center text-[10px] mt-3" style={{ color: 'var(--ink-muted)' }}>
          PAYG v2.0.0
        </p>
      </div>
    </aside>
  )
}

/* ───────────────── APP LAYOUT WRAPPER ─────────────────────────────────── */
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
      <style>{CSS_VARS}</style>
      <Sidebar />

      {/* Main content shifts when sidebar is visible */}
      <div className="md:ml-20 lg:ml-64 min-h-screen">
        {children}
      </div>

      <BottomNav />
    </div>
  )
}