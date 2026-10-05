import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const T = {
  s0: '#0A1F12', s1: '#102A18', s2: '#173A23',
  t4: '#65C37A', t6: '#27833D',
  ink: '#F0F6FC', muted: '#8B949E', border: '#2D4D35',
  green: '#5FBA72', orange: '#9DBB75', red: '#F87171',
  amber: '#F59E0B',
}

const css = `
  .ob-input {
    width: 100%; background: ${T.s2}; border: 1.5px solid ${T.border};
    border-radius: 14px; height: 52px; padding: 0 16px;
    color: ${T.ink}; font-size: 15px; font-family: inherit;
    outline: none; transition: border-color 0.18s; box-sizing: border-box;
  }
  .ob-input:focus { border-color: ${T.t4}; }
  .ob-input::placeholder { color: ${T.muted}; }
  .ob-input.err { border-color: ${T.red}; }
  .ob-seg {
    flex: 1; padding: 10px 6px; border-radius: 12px;
    border: 1.5px solid ${T.border}; background: ${T.s2};
    color: ${T.muted}; font-family: inherit; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.18s;
  }
  .ob-seg.active { border-color: ${T.t4}; background: rgba(101,195,122,0.08); color: ${T.t4}; }
  .teal-btn {
    width: 100%; background: var(--t6);
    color: #0A1F12; font-weight: 800; font-size: 15px; font-family: inherit;
    border: none; border-radius: 14px; height: 52px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.15s, transform 0.1s; margin-top: 24px;
  }
  .teal-btn:hover { opacity: 0.9; }
  .teal-btn:active { transform: scale(0.98); }
  .back-btn {
    width: 100%; background: none; border: none; cursor: pointer;
    color: ${T.muted}; font-family: inherit; font-size: 14px;
    padding: 12px 0; margin-top: 4px; transition: color 0.15s;
  }
  .back-btn:hover { color: ${T.ink}; }
  .plan-btn {
    width: 100%; display: flex; align-items: center; gap: 14px;
    padding: 16px; border-radius: 18px; border: 1.5px solid ${T.border};
    background: ${T.s2}; text-align: left; cursor: pointer;
    transition: all 0.18s; font-family: inherit;
  }
  .plan-btn.selected { border-color: ${T.t4}; background: rgba(101,195,122,0.07); }
  .label {
    display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: ${T.muted}; margin-bottom: 7px;
  }
  .err-msg { color: ${T.red}; font-size: 11px; margin-top: 4px; }
`

const STEPS = ['welcome', 'personal', 'kin', 'plan', 'done']
const STEP_META = [
  { label: 'Welcome',     icon: 'waving_hand' },
  { label: 'Personal',   icon: 'person' },
  { label: 'Next of Kin',icon: 'family_restroom' },
  { label: 'Plan',       icon: 'shield' },
  { label: 'Done',       icon: 'check_circle' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { login, changePlan } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: '',
    kinName: '', kinPhone: '', kinRelation: '', plan: 'Standard',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validatePersonal = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim())  e.lastName  = 'Required'
    if (!form.dob)               e.dob       = 'Required'
    if (!form.gender)            e.gender    = 'Required'
    setErrors(e); return Object.keys(e).length === 0
  }

  const validateKin = () => {
    const e = {}
    if (!form.kinName.trim())                    e.kinName  = 'Required'
    if (!/^0[789]\d{9}$/.test(form.kinPhone))   e.kinPhone = 'Valid Nigerian number required'
    if (!form.kinRelation)                       e.kinRelation = 'Required'
    setErrors(e); return Object.keys(e).length === 0
  }

  const next = async () => {
    if (step === 1 && !validatePersonal()) return
    if (step === 2 && !validateKin()) return
    if (step === STEPS.length - 1) {
      const prices = { Basic: 500, Standard: 1000, Premium: 2000 }
      try {
        const profile = await import('../utils/api.js').then(({ api }) => api.auth.updateProfile({
          firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dob, gender: form.gender,
          kinName: form.kinName, kinPhone: form.kinPhone, kinRelation: form.kinRelation,
        }))
        await changePlan(form.plan === 'Basic' ? 1 : form.plan === 'Standard' ? 2 : 3)
        login(profile.user); navigate('/dashboard')
      } catch (err) { setErrors({ form: err.message || 'Unable to complete onboarding' }) }
      return
    }
    setErrors({})
    setStep(s => s + 1)
  }

  const planOptions = [
    { id: 'Basic',    price: '₦500/mo',   benefit: 'Clinic visits',             icon: 'local_hospital',   iconBg: 'rgba(101,195,122,0.12)',   iconColor: T.t4 },
    { id: 'Standard', price: '₦1,000/mo', benefit: 'General care + virtual',    icon: 'health_and_safety', iconBg: 'var(--t6)', iconColor: '#0A1F12', featured: true },
    { id: 'Premium',  price: '₦2,000/mo', benefit: 'Full coverage',             icon: 'workspace_premium', iconBg: 'rgba(245,158,11,0.12)',   iconColor: T.amber },
  ]

  const progress = (step / (STEPS.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: T.s0, color: T.ink, display: 'flex' }}>
      <style>{css}</style>

      {/* Desktop sidebar */}
      <div style={{
        display: 'none', // shown via media query workaround below
        width: 280, background: T.s1, borderRight: `1px solid ${T.border}`,
        padding: 36, flexDirection: 'column', flexShrink: 0,
      }} className="ob-sidebar">
        <style>{`.ob-sidebar { display: none; } @media(min-width:1024px){ .ob-sidebar { display: flex !important; } }`}</style>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: `var(--t6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="icon" style={{ color: '#0A1F12', fontSize: 20 }}>shield</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, color: T.t4, letterSpacing: -0.5 }}>PAYG</span>
        </div>

        <h3 style={{ fontWeight: 800, fontSize: 16, color: T.ink, marginBottom: 4 }}>Setting up your account</h3>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 28 }}>Takes about 2 minutes</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STEP_META.map((s, i) => {
            const done   = i < step
            const active = i === step
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 14,
                background: active ? T.s2 : 'transparent',
                border: active ? `1px solid ${T.border}` : '1px solid transparent',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? T.green : active ? `var(--t6)` : T.s2,
                  border: done || active ? 'none' : `1px solid ${T.border}`,
                }}>
                  <span className="icon" style={{
                    fontSize: 14,
                    color: done || active ? (done ? '#0A1F12' : '#0A1F12') : T.muted,
                  }}>
                    {done ? 'check' : s.icon}
                  </span>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: 13,
                  color: active ? T.ink : done ? T.muted : T.border,
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 500, margin: '0 auto', padding: '0 24px' }}>

        {/* Mobile progress bar */}
        <div style={{ height: 3, background: T.border, margin: '0 -24px' }}>
          <div style={{
            height: '100%', background: `var(--t6)`,
            borderRadius: 99, width: `${progress}%`, transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ flex: 1, padding: '32px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Welcome */}
          {step === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(101,195,122,0.1)', border: '1px solid rgba(101,195,122,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              }}>
                <span className="icon" style={{ color: T.t4, fontSize: 44 }}>shield</span>
              </div>
              <h1 style={{ fontWeight: 900, fontSize: 34, letterSpacing: -1, marginBottom: 12 }}>Welcome to PAYG! 🎉</h1>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.65, marginBottom: 28, maxWidth: 340 }}>
                Let's set up your profile so we can personalise your coverage. Takes about 2 minutes.
              </p>
              <div style={{
                background: T.s1, border: `1px solid ${T.border}`,
                borderRadius: 18, padding: '16px 20px', textAlign: 'left', width: '100%', maxWidth: 340, marginBottom: 32,
              }}>
                {['Personal details', 'Next of kin', 'Choose your plan'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: `var(--t6)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0A1F12', fontSize: 11, fontWeight: 900, flexShrink: 0,
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal details */}
          {step === 1 && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: T.t4, marginBottom: 6 }}>Step 1 of 3</p>
              <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, marginBottom: 6 }}>Personal Details</h2>
              <p style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>Required for your insurance policy.</p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[['firstName', 'First name'], ['lastName', 'Last name']].map(([k, lb]) => (
                  <div key={k} style={{ flex: 1 }}>
                    <label className="label">{lb}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)}
                      className={`ob-input${errors[k] ? ' err' : ''}`} />
                    {errors[k] && <p className="err-msg">{errors[k]}</p>}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  className={`ob-input${errors.dob ? ' err' : ''}`} />
                {errors.dob && <p className="err-msg">{errors.dob}</p>}
              </div>

              <div>
                <label className="label">Gender</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <button key={g} onClick={() => set('gender', g)}
                      className={`ob-seg${form.gender === g ? ' active' : ''}`}>
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="err-msg">{errors.gender}</p>}
              </div>
            </div>
          )}

          {/* Next of kin */}
          {step === 2 && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: T.t4, marginBottom: 6 }}>Step 2 of 3</p>
              <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, marginBottom: 6 }}>Next of Kin</h2>
              <p style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>Required by insurance regulations.</p>

              {[['kinName', 'Full name', 'text', 'e.g. Adaeze Johnson'], ['kinPhone', 'Phone number', 'tel', 'e.g. 08012345678']].map(([k, lb, t, ph]) => (
                <div key={k} style={{ marginBottom: 16 }}>
                  <label className="label">{lb}</label>
                  <input type={t} value={form[k]} onChange={e => set(k, e.target.value)}
                    placeholder={ph} className={`ob-input${errors[k] ? ' err' : ''}`} />
                  {errors[k] && <p className="err-msg">{errors[k]}</p>}
                </div>
              ))}

              <div>
                <label className="label">Relationship</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map(r => (
                    <button key={r} onClick={() => set('kinRelation', r)}
                      className={`ob-seg${form.kinRelation === r ? ' active' : ''}`}>
                      {r}
                    </button>
                  ))}
                </div>
                {errors.kinRelation && <p className="err-msg">{errors.kinRelation}</p>}
              </div>
            </div>
          )}

          {/* Plan */}
          {step === 3 && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: T.t4, marginBottom: 6 }}>Step 3 of 3</p>
              <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, marginBottom: 6 }}>Choose Your Plan</h2>
              <p style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>You can change this anytime from your dashboard.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {planOptions.map(p => (
                  <button key={p.id} onClick={() => set('plan', p.id)}
                    className={`plan-btn${form.plan === p.id ? ' selected' : ''}`}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: p.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="icon" style={{ color: p.iconColor, fontSize: 22 }}>{p.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: T.ink }}>{p.id}</span>
                        {p.featured && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, background: T.orange, color: '#fff',
                            padding: '2px 8px', borderRadius: 99,
                          }}>Popular</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: T.muted }}>{p.benefit}</p>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: T.ink, flexShrink: 0 }}>{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {step === 4 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              {/* Glow ring */}
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(52,211,153,0.1)',
                border: '2px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                boxShadow: '0 0 32px rgba(52,211,153,0.2)',
              }}>
                <span className="icon" style={{ color: T.green, fontSize: 46 }}>check_circle</span>
              </div>
              <h1 style={{ fontWeight: 900, fontSize: 34, letterSpacing: -1, marginBottom: 10 }}>You're all set! 🎉</h1>
              <p style={{ color: T.muted, fontSize: 15, marginBottom: 8 }}>
                Welcome, <span style={{ fontWeight: 800, color: T.ink }}>{form.firstName}</span>!
              </p>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.65, maxWidth: 300 }}>
                Your <span style={{ fontWeight: 800, color: T.ink }}>{form.plan}</span> plan is ready. Top up your wallet to activate coverage.
              </p>
            </div>
          )}

          {/* CTA */}
          <button onClick={next} className="teal-btn">
            {step === STEPS.length - 1
              ? <><span className="icon-o">rocket_launch</span>Go to Dashboard</>
              : step === 0
              ? <><span className="icon-o">arrow_forward</span>Get Started</>
              : <><span className="icon-o">arrow_forward</span>Continue</>}
          </button>

          {step > 0 && step < STEPS.length - 1 && (
            <button onClick={() => { setStep(s => s - 1); setErrors({}) }} className="back-btn">
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
