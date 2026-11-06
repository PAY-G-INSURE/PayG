import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useNavigate } from 'react-router-dom'
import { Target, Eye, ArrowRight } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { fadeUp, staggerContainer, transition } from '../utils/animations'
import './AboutPage.css'

const values = [
  { letter: 'A', title: 'Available',  desc: 'We ensure insurance opportunities are within reach of everyone across Africa.' },
  { letter: 'A', title: 'Accessible', desc: 'We simplify access for underserved and informal populations who have been left behind.' },
  { letter: 'A', title: 'Affordable', desc: 'We promote payment options that genuinely reduce financial barriers to coverage.' },
  { letter: 'F', title: 'Flexible',   desc: 'We accommodate diverse payment preferences and the realities of irregular income.' },
  { letter: 'I', title: 'Inclusive',  desc: 'We design for individuals, cooperatives, and communities alike — no one left out.' },
]

function RevealSection({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, ...transition.smooth }}
    >
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <PageWrapper style={{ paddingTop: 'var(--nav-h)' }}>

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__blobs" aria-hidden="true">
          <motion.div
            className="about-hero__blob about-hero__blob--1"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="about-hero__blob about-hero__blob--2"
            animate={{ scale: [1.2, 1, 1.2], rotate: [60, 0, 60] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="container about-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition.smooth}
          >
            <span className="section-eyebrow" style={{ color: 'rgba(255,255,255,.65)', justifyContent: 'center' }}>
              ✦ Our Story
            </span>
            <h1 className="about-hero__heading">About PayG Insure</h1>
            <p className="about-hero__sub">
              Reimagining insurance accessibility by helping individuals and organised groups
              access coverage through flexible contribution models that reflect their financial realities.
            </p>
          </motion.div>
        </div>

        <div className="about-hero__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="section">
        <div className="container about-story">
          <RevealSection>
            <span className="section-eyebrow">Why We Started</span>
            <h2 className="section-title">The Gap We Saw</h2>
            <p className="about-story__text">
              Millions of people remain uninsured not because they do not value protection,
              but because existing payment structures fail to accommodate irregular income patterns.
              PayG Insure was created to bridge this gap by enabling flexible pathways to insurance
              access for individuals, cooperatives, and trade unions across Africa.
            </p>
            <p className="about-story__text" style={{ marginTop: '1rem' }}>
              We are not an insurance company. We are a payment platform that sits between you
              and the insurers — making the process simpler, more flexible, and genuinely inclusive
              for the people traditional insurance has always overlooked.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="section about-mv-section">
        <div className="container">
          <RevealSection>
            <span className="section-eyebrow">✦ Purpose</span>
            <h2 className="section-title" style={{ marginBottom: '3rem' }}>Mission & Vision</h2>
          </RevealSection>

          <motion.div
            className="about-mv-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon:  Target,
                label: 'Mission',
                bg:    'var(--primary)',
                text:  'To make insurance accessible through flexible and inclusive contribution systems that meet people where they are.',
              },
              {
                icon:  Eye,
                label: 'Vision',
                bg:    'var(--teal)',
                text:  'A future where every African can access and maintain insurance coverage regardless of income structure or payment capacity.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="about-mv-card"
                style={{ background: item.bg }}
                variants={fadeUp}
                transition={{ ...transition.smooth, delay: i * .15 }}
                whileHover={{ y: -6 }}
              >
                <item.icon
                  size={36}
                  strokeWidth={1.5}
                  style={{ marginBottom: '1.35rem', opacity: .82 }}
                />
                <h3 className="about-mv-card__label">{item.label}</h3>
                <p className="about-mv-card__text">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="section">
        <div className="container">
          <RevealSection>
            <span className="section-eyebrow">✦ Core Values</span>
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-subtitle">
              Five principles that guide every decision we make.
            </p>
          </RevealSection>

          <motion.div
            className="about-values-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="about-value-card"
                variants={fadeUp}
                transition={{ ...transition.smooth, delay: i * .08 }}
                whileHover={{ y: -5 }}
              >
                <div className="about-value-card__letter">{v.letter}</div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="container about-cta__inner">
          <RevealSection>
            <h2 className="about-cta__heading">
              Ready to Explore Insurance That Fits How You Earn?
            </h2>
            <div className="about-cta__actions">
              <motion.button
                className="btn btn-teal btn-lg"
                onClick={() => { window.location.href = '/health-insurance/plans' }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: .97 }}
              >
                View Insurance Plans <ArrowRight size={18} />
              </motion.button>
              <motion.button
                className="btn btn-outline btn-lg"
                onClick={() => { window.location.href = '/health-insurance/auth' }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: .97 }}
              >
                Get Started
              </motion.button>
            </div>
          </RevealSection>
        </div>
      </section>

    </PageWrapper>
  )
}
