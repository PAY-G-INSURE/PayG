import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

const T = {
  s0: '#0A1F12', s1: '#102A18', s2: '#173A23',
  t4: '#65C37A', t6: '#27833D',
  ink: '#F0F6FC', muted: '#8B949E', border: '#2D4D35',
  green: '#5FBA72', orange: '#9DBB75', red: '#F87171',
}

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .claim-spin { animation: spin 0.8s linear infinite; }
  .claim-card {
    background: ${T.s1}; border: 1px solid ${T.border};
    border-radius: 20px; padding: 20px;
    transition: border-color 0.2s;
  }
  .claim-card:hover { border-color: rgba(101,195,122,0.2); }
  .claim-type-btn {
    padding: 10px 4px; border-radius: 12px;
    border: 1.5px solid ${T.border};
    background: ${T.s2}; color: ${T.muted};
    font-family: inherit; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.18s;
  }
  .claim-type-btn.selected {
    border-color: ${T.t4}; background: rgba(101,195,122,0.08); color: ${T.t4};
  }
  .claim-textarea {
    width: 100%; background: ${T.s2}; border: 1.5px solid ${T.border};
    border-radius: 14px; padding: 14px 16px;
    color: ${T.ink}; font-size: 14px; font-family: inherit;
    resize: none; outline: none; transition: border-color 0.18s;
    box-sizing: border-box;
  }
  .claim-textarea:focus { border-color: ${T.t4}; }
  .claim-textarea::placeholder { color: ${T.muted}; }
  .claim-input {
    width: 100%; background: ${T.s2}; border: 1.5px solid ${T.border};
    border-radius: 14px; height: 54px; padding: 0 16px 0 40px;
    color: ${T.ink}; font-size: 20px; font-weight: 800; font-family: inherit;
    outline: none; transition: border-color 0.18s; box-sizing: border-box;
  }
  .claim-input:focus { border-color: ${T.t4}; }
  .claim-input::placeholder { color: ${T.muted}; }
  .err { border-color: ${T.red} !important; }
  .teal-btn {
    flex: 1; background: var(--t6);
    color: #0A1F12; font-weight: 800; font-size: 14px; font-family: inherit;
    border: none; border-radius: 14px; height: 50px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.18s;
  }
  .teal-btn:hover { opacity: 0.9; }
  .teal-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .ghost-btn {
    flex: 1; background: ${T.s2}; color: ${T.ink};
    font-weight: 700; font-size: 14px; font-family: inherit;
    border: 1px solid ${T.border}; border-radius: 14px; height: 50px; cursor: pointer;
    transition: border-color 0.18s;
  }
  .ghost-btn:hover { border-color: ${T.t4}; }
  .green-btn {
    flex: 1; background: rgba(52,211,153,0.15); color: ${T.green};
    font-weight: 800; font-size: 14px; font-family: inherit;
    border: 1px solid rgba(52,211,153,0.3); border-radius: 14px; height: 50px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
`

const CLAIM_TYPES = ['Outpatient', 'Inpatient', 'Pharmacy', 'Lab', 'Dental', 'Optical', 'Emergency', 'Other']

const STATUS_CFG = {
  submitted:    { label: 'Submitted',    bg: 'rgba(101,195,122,0.1)',  color: '#65C37A',  icon: 'schedule' },
  under_review: { label: 'Under Review', bg: 'rgba(251,146,60,0.1)',  color: '#9DBB75',  icon: 'manage_search' },
  approved:     { label: 'Approved',     bg: 'rgba(52,211,153,0.1)',  color: '#5FBA72',  icon: 'check_circle' },
  rejected:     { label: 'Rejected',     bg: 'rgba(248,113,113,0.1)', color: '#F87171',  icon: 'cancel' },
  paid:         { label: 'Paid',         bg: 'rgba(52,211,153,0.1)',  color: '#5FBA72',  icon: 'payments' },
}

const label = (text) => (
  <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
    {text}
  </span>
)

export default function Claims() {
  const { claims, submitClaim, subscription } = useApp()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ type: '', description: '', amount: '' })
  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.type) e.type = 'Select a claim type'
    if (!form.description.trim() || form.description.length < 10) e.description = 'Describe in at least 10 characters'
    if (!form.amount || parseInt(form.amount) < 100) e.amount = 'Minimum claim amount is ₦100'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitClaim({ type: form.type, description: form.description, amount: parseInt(form.amount) })
      setSubmitted(true)
      setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ type: '', description: '', amount: '' }) }, 1500)
    } catch (err) { setErrors({ form: err.message || 'Unable to submit claim' }) }
    finally { setSubmitting(false) }
  }

  return (
    <AppLayout>
      <style>{css}</style>
      <PageHeader
        title="Claims"
        subtitle={`${claims.length} total claim${claims.length !== 1 ? 's' : ''}`}
        right={
          <button onClick={() => setShowForm(true)} style={{
            background: `var(--t6)`,
            color: '#0A1F12', fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
            border: 'none', borderRadius: 12, padding: '9px 16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="icon-o" style={{ fontSize: 18 }}>add</span>
            <span>New Claim</span>
          </button>
        }
      />

      <div style={{ padding: '20px 20px 80px', maxWidth: 900 }}>
        {claims.length === 0 ? (
          <div style={{
            ...{}, background: T.s1, border: `1px solid ${T.border}`,
            borderRadius: 22, padding: '64px 24px', textAlign: 'center', marginTop: 16,
          }}>
            <span className="icon" style={{ fontSize: 48, color: T.border, display: 'block', marginBottom: 14 }}>receipt_long</span>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: T.ink, marginBottom: 8 }}>No claims yet</h3>
            <p style={{ fontSize: 14, color: T.muted, maxWidth: 260, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Submit a claim for any medical expenses covered under your {subscription.plan} plan.
            </p>
            <button onClick={() => setShowForm(true)} style={{
              background: `var(--t6)`,
              color: '#0A1F12', fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
              border: 'none', borderRadius: 14, padding: '12px 24px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span className="icon-o">add</span> File Your First Claim
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {claims.map((c, idx) => {
              const s = STATUS_CFG[c.status] || { label: c.status, bg: T.s2, color: T.muted, icon: 'info' }
              return (
                <div key={c.id || c.ref} className="claim-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span className="icon" style={{ color: T.orange, fontSize: 20 }}>receipt_long</span>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{c.type}</p>
                        <p style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{c.ref}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                      background: s.bg, color: s.color,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span className="icon" style={{ fontSize: 11 }}>{s.icon}</span>
                      {s.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 14,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, color: T.muted, marginBottom: 2 }}>Claim Amount</p>
                      <p style={{ fontWeight: 800, fontSize: 16, color: T.ink }}>₦{c.amount?.toLocaleString()}</p>
                    </div>
                    <p style={{ fontSize: 11, color: T.muted }}>
                      {new Date(c.date || c.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: 20, padding: '14px 16px',
          background: 'rgba(101,195,122,0.07)', border: '1px solid rgba(101,195,122,0.2)',
          borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span className="icon" style={{ color: T.t4, fontSize: 18, flexShrink: 0 }}>info</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.t4, marginBottom: 4 }}>How claims work</p>
            <p style={{ fontSize: 12, color: '#5EEAD4', lineHeight: 1.6 }}>
              Submit your claim with a description and amount. Our team reviews within 3–5 business days. Approved claims are paid directly to your bank account.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.s1, border: `1px solid ${T.border}`,
              borderRadius: '24px 24px 0 0', padding: '24px 24px 36px',
              width: '100%', maxWidth: 520,
              maxHeight: '90vh', overflowY: 'auto',
            }}>
            {/* handle */}
            <div style={{ width: 36, height: 4, background: T.border, borderRadius: 99, margin: '0 auto 20px' }} />

            <h3 style={{ fontWeight: 900, fontSize: 22, color: T.ink, marginBottom: 6 }}>New Claim</h3>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Complete the form below to submit your claim.</p>

            {label('Claim Type')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 4 }}>
              {CLAIM_TYPES.map(t => (
                <button key={t} onClick={() => set('type', t)}
                  className={`claim-type-btn${form.type === t ? ' selected' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
            {errors.type && <p style={{ color: T.red, fontSize: 11, marginBottom: 12 }}>{errors.type}</p>}

            <div style={{ marginTop: 16 }}>
              {label('Description')}
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the medical service, treatment or prescription..."
                rows={3}
                className={`claim-textarea${errors.description ? ' err' : ''}`}
              />
              {errors.description && <p style={{ color: T.red, fontSize: 11, marginTop: 4 }}>{errors.description}</p>}
            </div>

            <div style={{ marginTop: 16 }}>
              {label('Amount (₦)')}
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  fontWeight: 800, fontSize: 18, color: T.muted,
                }}>₦</span>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="0" className={`claim-input${errors.amount ? ' err' : ''}`} />
              </div>
              {errors.amount && <p style={{ color: T.red, fontSize: 11, marginTop: 4 }}>{errors.amount}</p>}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowForm(false)} className="ghost-btn">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || submitted}
                className={submitted ? 'green-btn' : 'teal-btn'}>
                {submitting
                  ? <><span className="claim-spin" style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A1F12', borderRadius: '50%' }} />Submitting…</>
                  : submitted
                  ? <><span className="icon" style={{ fontSize: 16 }}>check_circle</span>Submitted!</>
                  : <><span className="icon-o">send</span>Submit Claim</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
