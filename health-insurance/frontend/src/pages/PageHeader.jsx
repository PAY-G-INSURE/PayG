import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const STEPS = ['welcome', 'personal', 'kin', 'plan', 'done']

const STEP_META = [
  { label: 'Welcome',  icon: 'waving_hand' },
  { label: 'Personal', icon: 'person' },
  { label: 'Next of Kin', icon: 'family_restroom' },
  { label: 'Plan',     icon: 'shield' },
  { label: 'Done',     icon: 'check_circle' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { login, changePlan } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', gender: '', kinName: '', kinPhone: '', kinRelation: '', plan: 'Standard' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validatePersonal = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.dob) e.dob = 'Required'
    if (!form.gender) e.gender = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateKin = () => {
    const e = {}
    if (!form.kinName.trim()) e.kinName = 'Required'
    if (!/^0[789]\d{9}$/.test(form.kinPhone)) e.kinPhone = 'Valid Nigerian number required'
    if (!form.kinRelation) e.kinRelation = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 1 && !validatePersonal()) return
    if (step === 2 && !validateKin()) return
    if (step === STEPS.length - 1) {
      const prices = { Basic: 500, Standard: 1000, Premium: 2000 }
      changePlan(form.plan === 'Basic' ? 1 : form.plan === 'Standard' ? 2 : 3, form.plan, prices[form.plan])
      login({ ...form })
      navigate('/dashboard')
      return
    }
    setErrors({})
    setStep(s => s + 1)
  }

  const planOptions = [
    { id: 'Basic', price: '₦500/mo', benefit: 'Clinic visits', icon: 'local_hospital', c: 'bg-[#173A23]', ic: 'text-[#65C37A]' },
    { id: 'Standard', price: '₦1,000/mo', benefit: 'General care + virtual', icon: 'health_and_safety', c: 'bg-[var(--t6)]', ic: 'text-[#0A1F12]', featured: true },
    { id: 'Premium', price: '₦2,000/mo', benefit: 'Full coverage', icon: 'workspace_premium', c: 'bg-[#173A23]', ic: 'text-[#65C37A]' },
  ]

  const progress = (step / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-[#0A1F12] flex text-[#F0F6FC]">

      {/* Desktop left panel — step progress */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 bg-[#102A18] border-r border-[#2D4D35] p-10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[var(--t6)] flex items-center justify-center shadow-[0_0_15px_rgba(101,195,122,0.25)]">
            <span className="icon text-[#0A1F12] text-lg font-bold">shield</span>
          </div>
          <span className="font-display font-extrabold text-xl text-[#F0F6FC]">PAYG</span>
        </div>

        <h3 className="font-display font-bold text-[#F0F6FC] mb-1">Setting up your account</h3>
        <p className="text-xs text-[#8B949E] mb-8">Takes about 2 minutes</p>

        <div className="flex flex-col gap-3">
          {STEP_META.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? 'bg-[#173A23] shadow-[0_0_15px_rgba(101,195,122,0.05)]' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? 'bg-[#27833D]' : active ? 'bg-[#65C37A]' : 'bg-[#2D4D35]'
                }`}>
                  <span className={`icon text-base ${done ? 'text-[#F0F6FC]' : active ? 'text-[#0A1F12] font-bold' : 'text-[#8B949E]'}`}>
                    {done ? 'check' : s.icon}
                  </span>
                </div>
                <span className={`font-display font-semibold text-sm ${active ? 'text-[#65C37A]' : done ? 'text-[#8B949E] line-through opacity-70' : 'text-[#8B949E]'}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto px-5 lg:px-12 xl:px-16">

        {/* Mobile progress bar */}
        <div className="lg:hidden h-1 bg-[#2D4D35] -mx-5">
          <div className="h-full bg-[var(--t6)] transition-all duration-500 rounded-full" style={{ width: `${progress}%` }}/>
        </div>

        <div className="flex-1 px-0 py-8 flex flex-col">

          {/* Welcome */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center scale-in">
              <div className="w-24 h-24 bg-[rgba(101,195,122,0.15)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(101,195,122,0.1)]">
                <span className="icon text-[#65C37A] text-5xl">shield</span>
              </div>
              <h1 className="font-display font-black text-3xl lg:text-4xl text-[#F0F6FC] mb-3">Welcome to PAYG! 🎉</h1>
              <p className="text-[#8B949E] text-base leading-relaxed mb-6 max-w-sm">
                Let's set up your profile so we can personalise your coverage. Takes about 2 minutes.
              </p>
              <div className="bg-[#102A18] border border-[#2D4D35] rounded-2xl p-4 text-left w-full mb-8 max-w-sm">
                {['Personal details', 'Next of kin', 'Choose your plan'].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#173A23] border border-[#2D4D35] flex items-center justify-center text-[#65C37A] text-xs font-display font-bold flex-shrink-0">{i+1}</div>
                    <p className="text-sm font-display font-semibold text-[#F0F6FC]">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal details */}
          {step === 1 && (
            <div className="flex-1 fu">
              <p className="text-[11px] font-display font-bold text-[#65C37A] uppercase tracking-widest mb-1">Step 1 of 3</p>
              <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-[#F0F6FC] mb-1">Personal Details</h2>
              <p className="text-sm text-[#8B949E] mb-6">Required for your insurance policy.</p>

              <div className="flex gap-3 mb-4">
                {[['firstName','First name'],['lastName','Last name']].map(([k,lb]) => (
                  <div key={k} className="flex-1">
                    <label className="block text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">{lb}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)}
                      className={`w-full bg-[#102A18] border-2 rounded-2xl h-12 px-4 font-display text-[#F0F6FC] transition-all outline-none ${errors[k] ? 'border-red-500 focus:border-red-500' : 'border-[#2D4D35] focus:border-[#65C37A] focus:bg-[#173A23]'}`}/>
                    {errors[k] && <p className="text-red-400 text-[10px] mt-1">{errors[k]}</p>}
                  </div>
                ))}
              </div>

              <label className="block text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                className={`w-full bg-[#102A18] border-2 rounded-2xl h-12 px-4 font-display text-[#F0F6FC] transition-all outline-none mb-4 ${errors.dob ? 'border-red-500 focus:border-red-500' : 'border-[#2D4D35] focus:border-[#65C37A] focus:bg-[#173A23]'}`}/>
              {errors.dob && <p className="text-red-400 text-[10px] -mt-3 mb-4">{errors.dob}</p>}

              <label className="block text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-2">Gender</label>
              <div className="flex gap-2 mb-1">
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} onClick={() => set('gender', g)}
                    className={`flex-1 py-2.5 rounded-2xl font-display font-bold text-sm border-2 transition-all ${
                      form.gender === g ? 'border-[#65C37A] bg-[rgba(101,195,122,0.15)] text-[#65C37A]' : 'border-[#2D4D35] bg-[#102A18] text-[#8B949E] hover:border-[#173A23]'
                    }`}>{g}</button>
                ))}
              </div>
              {errors.gender && <p className="text-red-400 text-[10px] mt-1">{errors.gender}</p>}
            </div>
          )}

          {/* Next of kin */}
          {step === 2 && (
            <div className="flex-1 fu">
              <p className="text-[11px] font-display font-bold text-[#65C37A] uppercase tracking-widest mb-1">Step 2 of 3</p>
              <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-[#F0F6FC] mb-1">Next of Kin</h2>
              <p className="text-sm text-[#8B949E] mb-6">Required by insurance regulations.</p>

              {[['kinName','Full name','text','e.g. Adaeze Johnson'],['kinPhone','Phone number','tel','e.g. 08012345678']].map(([k,lb,t,ph]) => (
                <div key={k} className="mb-4">
                  <label className="block text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">{lb}</label>
                  <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                    className={`w-full bg-[#102A18] border-2 rounded-2xl h-12 px-4 font-display text-[#F0F6FC] transition-all outline-none placeholder-[#8B949E]/40 ${errors[k] ? 'border-red-500 focus:border-red-500' : 'border-[#2D4D35] focus:border-[#65C37A] focus:bg-[#173A23]'}`}/>
                  {errors[k] && <p className="text-red-400 text-[10px] mt-1">{errors[k]}</p>}
                </div>
              ))}

              <label className="block text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-2">Relationship</label>
              <div className="grid grid-cols-3 gap-2">
                {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map(r => (
                  <button key={r} onClick={() => set('kinRelation', r)}
                    className={`py-2.5 rounded-2xl font-display font-bold text-sm border-2 transition-all ${
                      form.kinRelation === r ? 'border-[#65C37A] bg-[rgba(101,195,122,0.15)] text-[#65C37A]' : 'border-[#2D4D35] bg-[#102A18] text-[#8B949E] hover:border-[#173A23]'
                    }`}>{r}</button>
                ))}
              </div>
              {errors.kinRelation && <p className="text-red-400 text-[10px] mt-2">{errors.kinRelation}</p>}
            </div>
          )}

          {/* Choose plan */}
          {step === 3 && (
            <div className="flex-1 fu">
              <p className="text-[11px] font-display font-bold text-[#65C37A] uppercase tracking-widest mb-1">Step 3 of 3</p>
              <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-[#F0F6FC] mb-1">Choose Your Plan</h2>
              <p className="text-sm text-[#8B949E] mb-6">You can change this anytime from your dashboard.</p>
              <div className="flex flex-col gap-3">
                {planOptions.map(p => (
                  <button key={p.id} onClick={() => set('plan', p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 text-left transition-all ${
                      form.plan === p.id ? 'border-[#65C37A] bg-[#102A18] shadow-[0_0_20px_rgba(101,195,122,0.08)]' : 'border-[#2D4D35] bg-[#0A1F12] hover:border-[#173A23]'
                    }`}>
                    <div className={`w-12 h-12 rounded-2xl ${p.c} flex items-center justify-center flex-shrink-0`}>
                      <span className={`icon text-2xl ${p.ic}`}>{p.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-[#F0F6FC]">{p.id}</span>
                        {p.featured && <span className="text-[9px] bg-[var(--t6)] text-[#0A1F12] font-display font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Popular</span>}
                      </div>
                      <p className="text-xs text-[#8B949E]">{p.benefit}</p>
                    </div>
                    <p className="font-display font-bold text-[#65C37A] text-sm">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center scale-in">
              <div className="w-24 h-24 bg-[rgba(101,195,122,0.1)] border border-[#27833D]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(101,195,122,0.15)]">
                <span className="icon text-[#65C37A] text-5xl">check_circle</span>
              </div>
              <h1 className="font-display font-black text-3xl lg:text-4xl text-[#F0F6FC] mb-3">You're all set! 🎉</h1>
              <p className="text-[#8B949E] text-base leading-relaxed mb-2">
                Welcome, <span className="font-display font-bold text-[#65C37A]">{form.firstName}</span>!
              </p>
              <p className="text-[#8B949E] text-sm leading-relaxed mb-8 max-w-xs">
                Your <span className="font-bold text-[#F0F6FC]">{form.plan}</span> plan is ready. Top up your wallet to activate coverage.
              </p>
            </div>
          )}

          {/* CTA */}
          <button onClick={next}
            className="w-full bg-[var(--t6)] text-[#0A1F12] font-display font-bold py-4 rounded-3xl shadow-[0_0_20px_rgba(101,195,122,0.2)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 text-base mt-6">
            {step === STEPS.length - 1
              ? <><span className="icon-o font-bold">rocket_launch</span>Go to Dashboard</>
              : step === 0 ? <><span className="icon-o font-bold">arrow_forward</span>Get Started</>
              : <><span className="icon-o font-bold">arrow_forward</span>Continue</>}
          </button>

          {step > 0 && step < STEPS.length - 1 && (
            <button onClick={() => { setStep(s => s - 1); setErrors({}) }}
              className="w-full text-[#8B949E] font-display text-sm py-3 mt-2 hover:text-[#F0F6FC] transition-colors">
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}