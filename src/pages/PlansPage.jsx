import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Shield, Users, Handshake,
  CalendarCheck, Smartphone, ArrowRight, Check, ExternalLink
} from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { transition } from '../utils/animations'
import './PlansPage.css'

const insurers = [
  { id: 'a', name: 'Insurer A', tagline: 'Pan-African Coverage' },
  { id: 'b', name: 'Insurer B', tagline: 'Affordable Plans'     },
  { id: 'c', name: 'Insurer C', tagline: 'Community Focused'    },
]

const plans = {
  health: [
    {
      name: 'Basic Health Plan',
      premium: '₦2,000/mo',
      coverage: ['Basic consultations', 'Essential treatments', 'Emergency care'],
    },
    {
      name: 'Standard Health Plan',
      premium: '₦5,000/mo',
      coverage: ['All basic benefits', 'Specialist visits', 'Lab tests', 'Dental (basic)'],
    },
    {
      name: 'Premium Health Plan',
      premium: '₦12,000/mo',
      coverage: ['All standard benefits', 'Surgery cover', 'Maternity care', 'Vision care'],
    },
  ],
  life: [
    {
      name: 'Term Life Basic',
      premium: '₦1,500/mo',
      coverage: ['₦500K death benefit', 'Accidental death rider'],
    },
    {
      name: 'Term Life Standard',
      premium: '₦3,500/mo',
      coverage: ['₦2M death benefit', 'Total disability', 'Critical illness'],
    },
  ],
}

const paymentOptions = [
  { icon: Users,         label: 'Cooperative Contribution', desc: 'Contributions through your registered cooperative.' },
  { icon: Handshake,     label: 'Trade Union Contribution', desc: 'Coverage supported by your trade union.' },
  { icon: CalendarCheck, label: 'Voluntary Contributions',  desc: 'Flexible payments at your preferred intervals.' },
  { icon: Smartphone,    label: 'Online payment',           desc: 'Fund contributions securely through the available payment provider.' },
]

const insuranceTypes = [
  {
    key: 'health',
    icon: Heart,
    label: 'Health Insurance',
    desc: 'Protect yourself and your family against medical expenses.',
    external: 'https://payg-health.netlify.app/',
  },
  {
    key: 'life',
    icon: Shield,
    label: 'Life Insurance',
    desc: 'Provide financial security for your loved ones.',
    external: null,
  },
]

export default function PlansPage() {
  const [activeType,    setActiveType   ] = useState(null)
  const [activeInsurer, setActiveInsurer] = useState(null)
  const [activePlan,    setActivePlan   ] = useState(null)
  const [activePayment, setActivePayment] = useState(null)
  const navigate = useNavigate()

  const reset = (level) => {
    if (level <= 1) { setActiveInsurer(null) }
    if (level <= 2) { setActivePlan(null)    }
    if (level <= 3) { setActivePayment(null) }
  }

  return (
    <PageWrapper style={{ paddingTop: 'var(--nav-h)' }}>

      {/* Header */}
      <section className="plans-hero">
        <div className="plans-hero__blobs" aria-hidden="true">
          <motion.div
            className="plans-hero__blob plans-hero__blob--1"
            animate={{ scale: [1,1.2,1], rotate: [0,90,0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="plans-hero__blob plans-hero__blob--2"
            animate={{ scale: [1.2,1,1.2], rotate: [60,0,60] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="container plans-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition.smooth}
          >
            <h1 className="plans-hero__heading">Find Insurance That Works For You</h1>
            <p className="plans-hero__sub">
              Explore options from our partner providers and choose a plan
              that fits your needs and budget.
            </p>
          </motion.div>
        </div>
        <div className="plans-hero__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* Flow */}
      <section className="section plans-flow">
        <div className="container plans-flow__inner">

          {/* Step 1 */}
          <div className="plans-step">
            <p className="plans-step__label">Step 1 — Choose Insurance Type</p>
            <div className="plans-type-grid">
              {insuranceTypes.map(type => (
                <motion.button
                  key={type.key}
                  className={`plans-type-card ${activeType === type.key ? 'plans-type-card--active' : ''}`}
                  onClick={() => {
  if (type.external) {
    window.open(type.external, '_blank')
  } else {
    setActiveType(type.key)
    reset(1)
  }
}}
                >
                  <type.icon
                    size={28}
                    strokeWidth={1.75}
                    style={{ color: activeType === type.key ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '1rem', transition: 'color .2s' }}
                  />
                  <h3 className="plans-type-card__title">{type.label}</h3>
                  <p  className="plans-type-card__desc">{type.desc}</p>
                  {type.external && (
  <span className="plans-type-card__external">
    <ExternalLink size={13} /> Redirects to partner site
  </span>
)}
                  {activeType === type.key && (
                    <motion.div
                      className="plans-type-card__check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Check size={14} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <AnimatePresence>
            {activeType && (
              <motion.div
                className="plans-step"
                key="step2"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -12 }}
                transition={transition.smooth}
              >
                <p className="plans-step__label">Step 2 — Choose Your Insurer</p>
                <div className="plans-insurer-grid">
                  {insurers.map(ins => (
                    <motion.button
                      key={ins.id}
                      className={`plans-insurer-card ${activeInsurer?.id === ins.id ? 'plans-insurer-card--active' : ''}`}
                      onClick={() => { setActiveInsurer(ins); reset(2) }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: .98 }}
                    >
                      <div className="plans-insurer-card__logo">
                        {ins.name[ins.name.length - 1]}
                      </div>
                      <p className="plans-insurer-card__name">{ins.name}</p>
                      <p className="plans-insurer-card__tag">{ins.tagline}</p>
                      {activeInsurer?.id === ins.id && (
                        <motion.div
                          className="plans-insurer-card__check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <Check size={12} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3 */}
          <AnimatePresence>
            {activeInsurer && (
              <motion.div
                className="plans-step"
                key="step3"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -12 }}
                transition={transition.smooth}
              >
                <p className="plans-step__label">Step 3 — Choose a Plan</p>
                <div className="plans-plan-list">
                  {plans[activeType].map(plan => (
                    <motion.button
                      key={plan.name}
                      className={`plans-plan-card ${activePlan?.name === plan.name ? 'plans-plan-card--active' : ''}`}
                      onClick={() => { setActivePlan(plan); reset(3) }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: .99 }}
                    >
                      <div className="plans-plan-card__top">
                        <div>
                          <h4 className="plans-plan-card__name">{plan.name}</h4>
                          <p className="plans-plan-card__via">via {activeInsurer.name}</p>
                        </div>
                        <span className="plans-plan-card__price">{plan.premium}</span>
                      </div>
                      <div className="plans-plan-card__badges">
                        {plan.coverage.map(c => (
                          <span key={c} className="badge badge-primary">{c}</span>
                        ))}
                      </div>
                      {activePlan?.name === plan.name && (
                        <motion.div
                          className="plans-plan-card__check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <Check size={14} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4 */}
          <AnimatePresence>
            {activePlan && (
              <motion.div
                className="plans-step"
                key="step4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -12 }}
                transition={transition.smooth}
              >
                <p className="plans-step__label">Step 4 — Choose Payment Method</p>
                <div className="plans-payment-grid">
                  {paymentOptions.map(opt => (
                    <motion.button
                      key={opt.label}
                      className={`plans-payment-card ${activePayment === opt.label ? 'plans-payment-card--active' : ''}`}
                      onClick={() => setActivePayment(opt.label)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: .97 }}
                    >
                      <opt.icon
                        size={22}
                        strokeWidth={1.75}
                        style={{ color: activePayment === opt.label ? 'var(--teal)' : 'var(--text-muted)', marginBottom: '.75rem', transition: 'color .2s' }}
                      />
                      <p className="plans-payment-card__label">{opt.label}</p>
                      <p className="plans-payment-card__desc">{opt.desc}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Info banner */}
                <div className="plans-info-banner">
                  Different payment methods may be available depending on your insurer and coverage plan.
                </div>

                <AnimatePresence>
                  {activePayment && (
                    <motion.button
                      className="btn btn-teal btn-lg plans-continue"
                      onClick={() => navigate('/join')}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={transition.smooth}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: .98 }}
                    >
                      Continue <ArrowRight size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </PageWrapper>
  )
}
