import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

const steps = ['Organisation Details', 'Contact & Access']

export default function OrgSignup() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    orgName: '', regNumber: '', members: '',
    orgType: '', contactName: '', phone: '',
    email: '', password: '', confirm: '',
  })
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <PageWrapper>
      <div className="auth-page">

        <div className="auth-page__left">
          <div className="auth-page__left-inner">

            <div className="auth-logo">
              <div className="auth-logo__icon" style={{ background: 'var(--teal)' }}>
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <span className="auth-logo__text" style={{ color: 'var(--teal)' }}>PayG<span style={{ color: 'var(--orange)' }}>Insure</span></span>
            </div>

            <div className="auth-steps">
              {steps.map((s, i) => (
                <div key={s} className="auth-step">
                  <div className="auth-step__bar" style={{ background: i <= step ? 'var(--teal)' : 'var(--border)' }} />
                  <span className="auth-step__label" style={{ color: i <= step ? 'var(--teal)' : 'var(--text-muted)' }}>{s}</span>
                </div>
              ))}
            </div>

            <h2 className="auth-form-heading">Create Organisation Account</h2>
            <p className="auth-form-sub">Step {step + 1} of {steps.length} — {steps[step]}</p>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s1" className="auth-form" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={transition.smooth}>
                  <div className="form-group">
                    <label className="form-label">Organisation Name</label>
                    <input className="form-input" placeholder="e.g. Lagos Market Cooperative" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input className="form-input" placeholder="RC 000000" value={form.regNumber} onChange={e => set('regNumber', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Members</label>
                    <input className="form-input" type="number" placeholder="e.g. 50" value={form.members} onChange={e => set('members', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organisation Type</label>
                    <select className="form-input form-select" value={form.orgType} onChange={e => set('orgType', e.target.value)}>
                      <option value="">Select type</option>
                      <option value="cooperative">Cooperative</option>
                      <option value="trade-union">Trade Union</option>
                    </select>
                  </div>
                  <button className="btn btn-teal" style={{ width: '100%', marginTop: '.5rem' }} onClick={() => setStep(1)}>
                    Next <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s2" className="auth-form" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={transition.smooth}>
                  <div className="form-group">
                    <label className="form-label">Contact Person's Name</label>
                    <input className="form-input" placeholder="Full name" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="optional">(Optional)</span></label>
                    <input className="form-input" type="email" placeholder="org@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                  </div>
                  <div className="auth-form__row auth-form__row--btns">
                    <button className="btn btn-ghost" style={{ display:'flex', alignItems:'center', gap:'.35rem' }} onClick={() => setStep(0)}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button className="btn btn-teal" style={{ flex: 1 }} onClick={() => navigate('/verify')}>
                      Create Account <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="auth-page__right" style={{ background: 'var(--primary-dark)' }}>
          <div className="auth-page__right-inner">
            <blockquote className="auth-quote">
              <p>"Built for cooperatives, trade unions, and the communities that hold Africa together."</p>
              <cite>— PayG Insure</cite>
            </blockquote>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
