import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../utils/api.js'


/* ─── Shared tokens (inline so this file is self-contained) ─────────────── */
const T = {
  s0: '#0A1F12', s1: '#102A18', s2: '#173A23',
  t4: '#65C37A', t6: '#27833D',
  ink: '#F0F6FC', muted: '#8B949E', border: '#2D4D35',
}

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-spin { animation: spin 0.8s linear infinite; }
  .auth-input {
    width: 100%; background: ${T.s2}; border: 1.5px solid ${T.border};
    border-radius: 14px; height: 54px; padding: 0 16px;
    color: ${T.ink}; font-size: 16px; font-family: inherit;
    transition: border-color 0.18s;
    outline: none;
  }
  .auth-input:focus { border-color: ${T.t4}; }
  .auth-input::placeholder { color: ${T.muted}; }
  .auth-input-filled { border-color: ${T.t4}; background: rgba(101,195,122,0.06); color: ${T.t4}; }
  .auth-otp {
    flex: 1; aspect-ratio: 1; text-align: center;
    background: ${T.s2}; border: 1.5px solid ${T.border};
    border-radius: 14px; font-size: 26px; font-weight: 900;
    color: ${T.ink}; font-family: inherit;
    transition: border-color 0.18s, background 0.18s;
    outline: none;
  }
  .auth-otp:focus { border-color: ${T.t4}; }
  .auth-otp.filled { border-color: ${T.t4}; background: rgba(101,195,122,0.08); color: ${T.t4}; }
  .auth-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px; border-radius: 10px; border: none; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 700; transition: all 0.18s; }
  .auth-tab.active { background: ${T.s1}; color: ${T.ink}; box-shadow: 0 1px 6px rgba(0,0,0,0.4); }
  .auth-tab.inactive { background: transparent; color: ${T.muted}; }
  .teal-btn {
    width: 100%; background: var(--t6);
    color: #0A1F12; font-weight: 800; font-size: 15px; font-family: inherit;
    border: none; border-radius: 14px; height: 52px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.18s, transform 0.1s;
  }
  .teal-btn:hover { opacity: 0.92; }
  .teal-btn:active { transform: scale(0.98); }
  .teal-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .label {
    display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: ${T.muted}; margin-bottom: 7px;
  }
`

export default function Auth() {
  const [mode, setMode]       = useState('phone')
  const [step, setStep]       = useState('input')
  const [value, setValue]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', ''])
  const [devCode, setDevCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const refs = [useRef(), useRef(), useRef(), useRef()]
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useApp()

  const validate = () => {
    if (mode === 'phone') {
      if (!/^0[789]\d{9}$/.test(value.replace(/\s/g, '')))
        return 'Enter a valid Nigerian number — e.g. 08012345678'
    }
    if (mode === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Enter a valid email address'
    }
    return null
  }

  const startCountdown = () => {
    setResendTimer(60)
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const handleSend = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const contact = mode === 'phone' ? { phone: value } : { email: value }
      const data = await api.auth.sendOtp(contact)
      setDevCode(data.devOtp || null)
      setStep('otp'); startCountdown()
    } catch (e) {
      setError(e.message || 'Could not send code. Check your connection.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setOtp(['', '', '', '']); setDevCode(null); setError('')
    await handleSend()
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const n = [...otp]; n[i] = val; setOtp(n)
    if (val && i < 3) refs[i + 1].current?.focus()
  }
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus()
  }

  const autoFill = () => {
    if (!devCode) return
    setOtp(devCode.split(''))
    refs[3].current?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 4) { setError('Enter the 4-digit code'); return }
    setError(''); setLoading(true)
    try {
      const contact = mode === 'phone' ? { phone: value } : { email: value }
      const data = await api.auth.verifyOtp(contact, code)
      if (data.token) localStorage.setItem('payg_token', data.token)
      login({ id: data.user.id, phone: data.user.phone, email: data.user.email,
        firstName: data.user.firstName, lastName: data.user.lastName, isOnboarded: data.user.isOnboarded })
      navigate(data.isNew ? '/onboarding' : '/dashboard')    } catch (e) {
      setError(e.message || 'Verification failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.s0, color: T.ink,
      display: 'flex', flexDirection: 'column',
      maxWidth: 480, margin: '0 auto', padding: '0 24px',
      position: 'relative',
    }}>
      <style>{css}</style>

      {/* ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300,
        background: 'none',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Back */}
        <div style={{ paddingTop: 36 }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: T.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            <span className="icon-o" style={{ fontSize: 20 }}>arrow_back</span>
            Back
          </Link>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 36 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'var(--t6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="icon" style={{ color: '#0A1F12', fontSize: 20 }}>shield</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, color: T.t4, letterSpacing: -0.5 }}>PAYG</span>
        </div>

        {/* ── STEP 1: Input ───────────────────────────────────────────────── */}
        {step === 'input' && (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 6, letterSpacing: -1 }}>Welcome! 👋</h1>
            <p style={{ color: T.muted, marginBottom: 28, fontSize: 15 }}>Sign in or create your account</p>

            {/* Tab toggle */}
            <div style={{
              display: 'flex', background: T.s2, border: `1px solid ${T.border}`,
              borderRadius: 13, padding: 4, marginBottom: 24,
            }}>
              {[['phone', 'smartphone', 'Phone'], ['email', 'mail', 'Email unavailable']].map(([m, ic, lb]) => (
                <button key={m}
                  disabled={m === 'email'}
                  onClick={() => { setMode(m); setValue(''); setError('') }}
                  className={`auth-tab ${mode === m ? 'active' : 'inactive'} ${m === 'email' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="icon-o" style={{ fontSize: 16 }}>{ic}</span> {lb}
                </button>
              ))}
            </div>

            <label className="label">{mode === 'phone' ? 'Phone Number' : 'Email Address'}</label>

            {mode === 'phone' ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: T.s2, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: '0 14px',
                  fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  🇳🇬 +234
                </div>
                <input
                  type="tel" value={value}
                  onChange={e => { setValue(e.target.value.replace(/\D/g, '')); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="08012345678" maxLength={11} autoFocus
                  className="auth-input" style={{ flex: 1 }}
                />
              </div>
            ) : (
              <input
                type="email" value={value}
                onChange={e => { setValue(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="you@example.com" autoFocus
                className="auth-input" style={{ marginBottom: 4 }}
              />
            )}

            {error && (
              <p style={{ color: '#F87171', fontSize: 12, marginTop: 6, marginBottom: 4,
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="icon-o" style={{ fontSize: 14 }}>error</span>{error}
              </p>
            )}

            <button onClick={handleSend} disabled={loading} className="teal-btn" style={{ marginTop: 20 }}>
              {loading
                ? <><span className="auth-spin" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A1F12', borderRadius: '50%' }} />Sending code…</>
                : <><span className="icon-o" style={{ fontSize: 18 }}>send</span>Send Verification Code</>}
            </button>

            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: 'rgba(101,195,122,0.07)', border: '1px solid rgba(101,195,122,0.2)',
              borderRadius: 12,
            }}>
              <p style={{ fontSize: 12, color: T.t4, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span className="icon" style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>info</span>
                New to PAYG? We'll create your account automatically — no password needed.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: OTP ─────────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 900, fontSize: 30, marginBottom: 6, letterSpacing: -0.8 }}>
              {mode === 'phone' ? 'Check your SMS 📱' : 'Check your inbox 📧'}
            </h1>
            <p style={{ color: T.muted, marginBottom: 24, fontSize: 15 }}>
              We sent a 4-digit code to{' '}
              <span style={{ fontWeight: 700, color: T.ink }}>{value}</span>
            </p>

            {/* Dev banner */}
            {devCode && (
              <button onClick={autoFill} style={{
                width: '100%', marginBottom: 20,
                background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.3)',
                borderRadius: 14, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="icon" style={{ color: '#F59E0B', fontSize: 16 }}>construction</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>Demo mode — your code is:</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.12)',
                    padding: '2px 8px', borderRadius: 99 }}>Click to auto-fill →</span>
                </div>
                <p style={{ fontWeight: 900, fontSize: 32, color: '#F59E0B', letterSpacing: '0.3em', paddingLeft: 22 }}>
                  {devCode}
                </p>
                <p style={{ fontSize: 10, color: '#D97706', marginTop: 4, paddingLeft: 22 }}>
                  This only appears because no SMS provider is connected yet.
                </p>
              </button>
            )}

            <label className="label" style={{ marginBottom: 12 }}>Verification Code</label>

            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              {otp.map((d, i) => (
                <input
                  key={i} ref={refs[i]} type="text" inputMode="numeric"
                  maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  className={`auth-otp${d ? ' filled' : ''}`}
                />
              ))}
            </div>

            {error && (
              <p style={{ color: '#F87171', fontSize: 12, marginTop: 4, marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="icon-o" style={{ fontSize: 14 }}>error</span>{error}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 24px' }}>
              <p style={{ fontSize: 12, color: T.muted }}>Didn't receive it?</p>
              {resendTimer > 0 ? (
                <p style={{ fontSize: 12, color: T.muted }}>
                  Resend in <span style={{ fontWeight: 700, color: T.ink }}>{resendTimer}s</span>
                </p>
              ) : (
                <button onClick={handleResend} style={{
                  fontSize: 12, fontWeight: 700, color: '#9DBB75',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  Resend Code
                </button>
              )}
            </div>

            <button onClick={handleVerify} disabled={loading || otp.join('').length < 4} className="teal-btn" style={{ marginBottom: 12 }}>
              {loading
                ? <><span className="auth-spin" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A1F12', borderRadius: '50%' }} />Verifying…</>
                : <><span className="icon-o">verified</span>Verify & Continue</>}
            </button>

            <button
              onClick={() => { setStep('input'); setOtp(['', '', '', '']); setDevCode(null); setError(''); clearInterval(timerRef.current) }}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                color: T.muted, fontSize: 14, padding: '10px 0' }}>
              ← Change {mode === 'phone' ? 'phone number' : 'email'}
            </button>
          </div>
        )}

        <p style={{ marginTop: 'auto', padding: '24px 0', textAlign: 'center', fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <Link to="/terms" style={{ color: T.t4, fontWeight: 700, textDecoration: 'none' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" style={{ color: T.t4, fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
