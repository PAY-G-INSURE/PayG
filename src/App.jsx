import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Lenis from 'lenis'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage            from './pages/HomePage'
import AboutPage           from './pages/AboutPage'
import PlansPage           from './pages/PlansPage'
import IndividualSignup    from './pages/auth/IndividualSignup'
import OrgSignup           from './pages/auth/OrgSignup'
import OTPPage             from './pages/auth/OTPPage'
import SuccessPage         from './pages/auth/SuccessPage'
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage'
import IndividualDashboard from './pages/dashboard/IndividualDashboard'
import CoopDashboard       from './pages/dashboard/CoopDashboard'
import ProductChoicePage   from './pages/ProductChoicePage'

const DASHBOARD_ROUTES = ['/dashboard', '/coop-dashboard']

function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function AppShell() {
  const location = useLocation()
  const isDashboard = DASHBOARD_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <>
      <LenisProvider/>
      <ScrollToTop/>
      {!isDashboard && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/plans"             element={<PlansPage />} />
          <Route path="/choose-insurance"  element={<ProductChoicePage />} />
          <Route path="/join"              element={<Navigate to="/choose-insurance" replace />} />
          <Route path="/signup/individual" element={<IndividualSignup />} />
          <Route path="/signup/organisation" element={<OrgSignup />} />
          <Route path="/verify"            element={<OTPPage />} />
          <Route path="/success"           element={<SuccessPage />} />
          <Route path="/login"             element={<Navigate to="/choose-insurance" replace />} />
          <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
          <Route path="/dashboard"         element={<IndividualDashboard />} />
          <Route path="/coop-dashboard"    element={<CoopDashboard />} />
        </Routes>
      </AnimatePresence>
      {!isDashboard && <Footer />}
    
      
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
