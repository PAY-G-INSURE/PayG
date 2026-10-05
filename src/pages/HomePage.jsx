import { useRef, useState, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useInView } from 'react-intersection-observer'
import { useCountUp } from 'react-countup'
import {
  Shield, Users, BarChart3, ArrowRight,
  Lock, Calendar, UserX, Wallet,
  CheckCircle, ChevronRight, Smartphone
} from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { fadeUp, staggerContainer, transition } from '../utils/animations'
import './HomePage.css'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import * as THREE from 'three'


/* ─────────────────────────────────────────
   3D ANIMATED SHIELD
───────────────────────────────────────── */
import { Float, Environment, useTexture } from '@react-three/drei'
function AnimatedLogo() {
  const groupRef = useRef()
  const [geometry, setGeometry] = useState(null)

  useEffect(() => {
    const loader = new SVGLoader()
    loader.load('/logo-white.svg', (data) => {
      const shapes = []
      for (const path of data.paths) {
        for (const shape of SVGLoader.createShapes(path)) {
          shapes.push(shape)
        }
      }
      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth: 20,
          bevelEnabled: true,
          bevelThickness: 4,
          bevelSize: 2.5,
          bevelSegments: 6,
        })
        geo.center()
        setGeometry(geo)
      }
    })
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.008
  })

  if (!geometry) return null

  return (
    <group ref={groupRef} scale={[0.006, -0.006, 0.006]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#C0C8D8"
          metalness={0.95}
          roughness={0.05}
          emissive="#4466AA"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────
   HERO CAROUSEL
───────────────────────────────────────── */
const heroSlides = [
  {
    eyebrow: 'For Market Traders',
    heading: 'Health Cover for\nThe Way You Work',
    sub: 'Flexible health contributions for traders, artisans, and people with irregular income.',
    cta: 'Get Started',
    ctaPath: '/join',
    bg: 'var(--primary-dark)',
  },
  {
    eyebrow: 'For Cooperatives',
    heading: 'Health Cover for\nOrganised Groups',
    sub: 'Coordinate health contributions through your cooperative or trade union.',
    cta: 'For Cooperatives',
    ctaPath: '/plans',
    bg: 'var(--primary)',
  },
  {
    eyebrow: 'For Students',
    heading: 'Choose a Plan\nThat Suits You',
    sub: 'Review available plans and contribution amounts before you enroll.',
    cta: 'View Plans',
    ctaPath: '/plans',
    bg: 'var(--primary-dark)',
  },
  {
    eyebrow: 'For Transport Workers',
    heading: 'Manage Your Cover\nFrom Your Phone',
    sub: 'View your plan, contribution history, and account updates in one place.',
    cta: 'Learn More',
    ctaPath: '/about',
    bg: 'var(--primary)',
  },
]

function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, 40])
  const opacity = useTransform(scrollY, [0, 800], [1, 0.15])
  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % heroSlides.length)
    }, 5500)
    return () => clearInterval(id)
  }, [current])

  const slide = heroSlides[current]

  const goTo = (i) => {
    setPrev(current)
    setCurrent(i)
  }

  return (
    <section
      className="hero"
      style={{ background: slide.bg, transition: 'background 1.2s ease' }}
    >
      {/* Animated background blobs */}
      <div className="hero__blobs" aria-hidden="true">
        <motion.div
          className="hero__blob hero__blob--1"
          animate={{ scale: [1, 1.25, 1], rotate: [0, 120, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="hero__blob hero__blob--2"
          animate={{ scale: [1.2, 1, 1.2], rotate: [60, 0, 60] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="hero__blob hero__blob--3"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container hero__inner">

        {/* Left — Text content */}
        <motion.div className="hero__content" style={{ y }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: .65, ease: [.22, 1, .36, 1] }}
            >
              {/* Eyebrow */}
              <div className="hero__eyebrow">
                <motion.span
                  className="hero__eyebrow-dot"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {slide.eyebrow}
              </div>

              {/* Heading */}
              <h1 className="hero__heading">
                {slide.heading.split('\n').map((line, i) => (
                  <span key={i} className="hero__heading-line">
                    {line}
                  </span>
                ))}
              </h1>

              {/* Subheading */}
              <p className="hero__sub">{slide.sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Buttons — outside AnimatePresence so they don't re-animate on slide change */}
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .5, ...transition.smooth }}
          >
            <motion.button
              className="btn btn-teal btn-lg"
              onClick={() => navigate(slide.ctaPath)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: .97 }}
            >
              {slide.cta} <ArrowRight size={18} />
            </motion.button>
            <motion.button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/plans')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: .97 }}
            >
              View Plans
            </motion.button>
          </motion.div>

          {/* Slide dots */}
          <div className="hero__dots" role="tablist" aria-label="Hero slides">
            {heroSlides.map((_, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
                className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
                onClick={() => goTo(i)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: .9 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Right — 3D Canvas */}
        <motion.div
          className="hero__canvas-wrap"
          initial={{ opacity: 0, scale: .75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [.22, 1, .36, 1], delay: .25 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Canvas camera={{ position: [0, 0, 4.5], fov: 42 }} style={{ width: '100%', height: '100%' }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.2} />
              <pointLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
              <pointLight position={[-5, -5, -5]} intensity={1.5} color="#C0C0C0" />
              <pointLight position={[0, 5, -5]} intensity={1} color="#aaaaff" />
              <pointLight position={[0, -5, 5]} intensity={0.8} color="#ffffff" />
              <spotLight
                position={[0, 10, 5]}
                angle={0.25}
                penumbra={1}
                intensity={3}
                color="#ffffff"
                castShadow
              />
              <AnimatedLogo />
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
          <div className="hero__canvas-glow" aria-hidden="true" />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="hero__scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <ChevronRight size={15} style={{ transform: 'rotate(90deg)' }} />
      </motion.div>

      {/* Wave divider */}
      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
        </svg>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   STATS BAR
───────────────────────────────────────── */
const stats = [
  { value: 1, suffix: 'K+', label: 'People Reached' },
  { value: 12, suffix: '+', label: 'Partner Insurers' },
  { value: 98, suffix: '%', label: 'Claims Satisfaction' },
  { value: 6, suffix: '+', label: 'States Covered' },
]

function StatItem({ value, suffix, label, inView, delay }) {
  const { countUp, start } = useCountUp({
    ref: `counter-${label}`,
    end: value,
    duration: 2.2,
    startOnMount: false,
  })

  useEffect(() => {
    if (inView) start()
  }, [inView])

  return (
    <div className="stats-bar__item">
      <span className="stats-bar__value">
        <span id={`counter-${label}`} />
        {suffix}
      </span>
      <span className="stats-bar__label">{label}</span>
    </div>
  )
}

function StatsBar() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section className="stats-bar" ref={ref}>
      <div className="container stats-bar__inner">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * .1, ...transition.smooth }}
          >
            <StatItem
              value={s.value}
              suffix={s.suffix}
              label={s.label}
              inView={inView}
              delay={i * 0.15}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PROBLEM SECTION
───────────────────────────────────────── */
const problems = [
  {
    icon: Lock,
    title: 'Limited Access',
    desc: 'Millions remain uninsured due to rigid entry barriers and premiums that are out of reach for informal workers.',
    color: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    icon: Calendar,
    title: 'Rigid Payments',
    desc: 'Fixed monthly structures exclude the majority whose income is seasonal, daily, or irregular.',
    color: '#FFF7ED',
    iconColor: '#F97316',
  },
  {
    icon: UserX,
    title: 'Exclusion',
    desc: 'Informal workers — the backbone of African economies — are systematically left out of traditional insurance.',
    color: '#F0FDF4',
    iconColor: '#15803D',
  },
]

function ProblemSection() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section className="section problem-section" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={transition.smooth}
        >
          <span className="section-eyebrow">⚡ The Problem</span>
          <h2 className="section-title">Why Most Africans Remain Uninsured</h2>
          <p className="section-subtitle">
            Traditional insurance was not built for how most Africans earn and live.
          </p>
        </motion.div>

        <motion.div
          className="problem-cards"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              className="problem-card"
              variants={fadeUp}
              transition={{ ...transition.smooth, delay: i * .1 }}
              whileHover={{ y: -6 }}
            >
              <div
                className="problem-card__icon"
                style={{ background: p.color, color: p.iconColor }}
              >
                <p.icon size={24} strokeWidth={1.75} />
              </div>
              <h3 className="problem-card__title">{p.title}</h3>
              <p className="problem-card__desc">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   SOLUTION SECTION
───────────────────────────────────────── */
const solutions = [
  {
    icon: Wallet,
    title: 'Flexible Payments',
    desc: 'Choose from the contribution options available for your plan and location.',
  },
  {
    icon: Users,
    title: 'Cooperative Contributions',
    desc: 'Coordinate enrollment and contributions through a cooperative or trade union.',
  },
  {
    icon: Shield,
    title: 'Insurance Access',
    desc: 'Browse and connect to verified partner insurers. Choose from multiple plan options that suit your life.',
  },
  {
    icon: BarChart3,
    title: 'Easy Tracking',
    desc: 'Monitor your coverage, payments, and claims from one clean dashboard — anytime, anywhere.',
  },
]

function SolutionSection() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section className="section solution-section" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={transition.smooth}
        >
            <span className="section-eyebrow">About PayG Insure</span>
          <h2 className="section-title">Built for How Africa Actually Works</h2>
          <p className="section-subtitle">
            PayG connects individuals and organised groups with flexible insurance options.
          </p>
        </motion.div>

        <motion.div
          className="solution-grid"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              className="solution-card"
              variants={fadeUp}
              transition={{ ...transition.smooth, delay: i * .1 }}
              whileHover={{ y: -6 }}
            >
              <div className="solution-card__icon">
                <s.icon size={26} strokeWidth={1.75} />
              </div>
              <h3 className="solution-card__title">{s.title}</h3>
              <p className="solution-card__desc">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
const steps = [
  {
    n: '01',
    title: 'Create Account',
    desc: 'Sign up as an individual or organisation in under 2 minutes. Phone number is all you need.',
  },
  {
    n: '02',
    title: 'Choose a Plan',
    desc: 'Browse partner insurers and select a plan that fits your needs and budget.',
  },
  {
    n: '03',
    title: 'Select Payment Method',
    desc: 'Review the contribution methods available for your selected plan.',
  },
  {
    n: '04',
    title: 'Stay Covered',
    desc: 'Your coverage activates immediately. Track payments and claims from your dashboard.',
  },
]

function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section className="section how-section" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={transition.smooth}
        >
          <span className="section-eyebrow">→ How It Works</span>
          <h2 className="section-title">Four Steps to Coverage</h2>
        </motion.div>

        <div className="how-steps">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              className="how-step"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * .15, ...transition.smooth }}
            >
              <div className="how-step__num">{s.n}</div>
              {i < steps.length - 1 && (
                <motion.div
                  className="how-step__connector"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ delay: i * .15 + .4, duration: .5, ease: [.22, 1, .36, 1] }}
                />
              )}
              <h3 className="how-step__title">{s.title}</h3>
              <p className="how-step__desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────── */
const checks = ['No fixed premiums', 'Cancel anytime', 'Instant activation']

function CTABanner() {
  const navigate = useNavigate()
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section className="cta-banner" ref={ref}>
      <motion.div
        className="cta-banner__inner container"
        initial={{ opacity: 0, scale: .95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={transition.slow}
      >
        <motion.h2
          className="cta-banner__heading"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: .15, ...transition.smooth }}
        >
          Ready for Insurance That Works for You?
        </motion.h2>

        <motion.p
          className="cta-banner__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: .25, ...transition.smooth }}
        >
          Review the available plans and choose the next step that works for you.
        </motion.p>

        <motion.div
          className="cta-banner__actions"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: .35, ...transition.smooth }}
        >
          <motion.button
            className="btn btn-teal btn-lg"
            onClick={() => navigate('/join')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: .97 }}
          >
            Get Started <ArrowRight size={18} />
          </motion.button>
          <motion.button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/plans')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: .97 }}
          >
            View Plans
          </motion.button>
        </motion.div>

        <motion.div
          className="cta-banner__checks"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: .5, ...transition.smooth }}
        >
          {checks.map(t => (
            <span key={t} className="cta-banner__check-item">
              <CheckCircle size={14} /> {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────── */
export default function HomePage() {
  return (
    <PageWrapper>
      <HeroSection />
      <StatsBar />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <CTABanner />
    </PageWrapper>
  )
}
