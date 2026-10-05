import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

const HEALTH_PLANS = [
  { 
    id: 1, 
    name: 'Basic',    
    price: 500,  
    tagline: 'Essential protection',          
    icon: 'local_hospital',   
    featured: false,
    features: ['Clinic visits & consultations', 'Basic lab tests', 'Digital health records', 'SMS health alerts'] 
  },
  { 
    id: 2, 
    name: 'Standard', 
    price: 1000, 
    tagline: 'Comprehensive care',            
    icon: 'health_and_safety', 
    featured: true,
    features: ['Everything in Basic', '24/7 virtual consultations', 'Specialized lab tests', 'Pharmacy discounts (20%)', 'Specialist referrals', 'Mental health support'] 
  },
  { 
    id: 3, 
    name: 'Premium',  
    price: 2000, 
    tagline: 'Full coverage, no compromises', 
    icon: 'workspace_premium', 
    featured: false,
    features: ['Everything in Standard', 'Private hospital ward', 'International coverage', 'Dedicated health concierge', 'Annual full-body checkup', 'Dental & optical care'] 
  },
]

const LIFE_PLANS = [
  { 
    id: 4, 
    name: 'Basic Life', 
    price: 800, 
    tagline: 'Essential peace of mind', 
    icon: 'shield', 
    featured: false,
    features: ['₦500,000 life cover', 'Instant payout to beneficiary', 'No medical exams', 'SMS status tracking'] 
  }
]

export default function Plans() {
  const { subscription, changePlan } = useApp()
  const navigate = useNavigate()
  const currentPlan = subscription?.planName || 'Standard'
  const [selected, setSelected] = useState(currentPlan)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedPlan = HEALTH_PLANS.find(p => p.name === selected) || LIFE_PLANS.find(p => p.name === selected)
  const hasChanges = selected !== currentPlan

  const getPrice = (name) => {
    const p = HEALTH_PLANS.find(x => x.name === name) || LIFE_PLANS.find(x => x.name === name)
    return p ? p.price : 0
  }

  const isUpgrade = selectedPlan ? getPrice(selected) > getPrice(currentPlan) : true

  const handleConfirm = () => {
    if (!hasChanges) { 
      navigate('/dashboard')
      return
    }
    setSaving(true)
    changePlan(selectedPlan.id).then(() => {
      setSaving(false); setSaved(true); setTimeout(() => navigate('/dashboard'), 1000)
    }).catch(() => setSaving(false))
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Insurance Plans" 
        subtitle="Select a coverage matrix tier tailored directly into your network micro-billing channel." 
      />
      
      <div className="min-h-screen py-8 px-6 lg:px-10 pb-36 relative" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        {/* Background Radial Glow */}
        <div className="absolute top-[20%] left-1/4 w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none filter blur-[120px]" style={{ background: 'var(--primary)' }}></div>

        {/* Health Plans Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="font-display font-black text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--teal)' }}>Health Insurance Protocols</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HEALTH_PLANS.map(plan => {
              const isCurrent = plan.name === currentPlan
              const isSelected = plan.name === selected

              return (
                <div 
                  key={plan.id} 
                  onClick={() => setSelected(plan.name)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected ? 'scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface)', 
                    borderColor: isSelected ? 'var(--primary-light)' : 'var(--border)' 
                  }}
                >
                  {plan.featured && (
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'var(--t6)' }}></div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <span className="icon text-white">{plan.icon}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border" style={{ backgroundColor: 'rgba(20,184,166,0.1)', borderColor: 'var(--teal)', color: 'var(--teal)' }}>
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-xl text-white mb-1">{plan.name}</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{plan.tagline}</p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-2xl font-black text-white">₦{plan.price.toLocaleString()}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/month</span>
                    </div>

                    <div className="w-full h-px mb-6" style={{ backgroundColor: 'var(--border)' }}></div>

                    <ul className="flex flex-col gap-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs leading-normal" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          <span className="icon text-sm mt-0.5" style={{ color: 'var(--teal)' }}>check_circle</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Life Plans Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-black text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--primary-light)' }}>Life Coverage Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LIFE_PLANS.map(plan => {
              const isCurrent = plan.name === currentPlan
              const isSelected = plan.name === selected

              return (
                <div 
                  key={plan.id} 
                  onClick={() => setSelected(plan.name)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected ? 'scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface)', 
                    borderColor: isSelected ? 'var(--primary-light)' : 'var(--border)' 
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <span className="icon text-white">{plan.icon}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border" style={{ backgroundColor: 'rgba(20,184,166,0.1)', borderColor: 'var(--teal)', color: 'var(--teal)' }}>
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-xl text-white mb-1">{plan.name}</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{plan.tagline}</p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-2xl font-black text-white">₦{plan.price.toLocaleString()}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/month</span>
                    </div>

                    <div className="w-full h-px mb-6" style={{ backgroundColor: 'var(--border)' }}></div>

                    <ul className="flex flex-col gap-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs leading-normal" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          <span className="icon text-sm mt-0.5" style={{ color: 'var(--teal)' }}>check_circle</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Fixed Action Floating Box */}
        <div className="fixed bottom-6 left-0 right-0 z-40 px-6 max-w-lg mx-auto w-full">
          <div className="p-4 border rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-4" style={{ backgroundColor: 'rgba(19, 25, 38, 0.95)', borderColor: 'var(--border)' }}>
            {hasChanges && (
              <p className="text-xs text-center font-medium leading-relaxed" style={{ color: 'var(--orange)' }}>
                {isUpgrade 
                  ? `Upgrading to ${selected}. Next premium cycle extracts ₦${selectedPlan?.price.toLocaleString()}/mo.`
                  : `Downgrading to ${selected}. Structural updates switch over next billing interval.`}
              </p>
            )}
            
            <button 
              onClick={handleConfirm} 
              disabled={saving || saved}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: saved ? 'var(--teal)' : 'var(--t6)' }}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing Node...
                </>
              ) : saved ? (
                'Plan Configured!'
              ) : !hasChanges ? (
                `Keep ${selected} Structure`
              ) : (
                `Confirm Tier Switch`
              )}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
