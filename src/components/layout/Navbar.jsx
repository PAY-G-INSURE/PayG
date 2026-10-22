import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import logoWhite from '../../assets/logo-white.png'
import './Navbar.css'

const links = [
  { label: 'Home',             path: '/' },
  { label: 'About',            path: '/about' },
  { label: 'Insurance Plans',  path: '/plans' },
  { label: 'For Cooperatives', path: '/plans' },
  { label: 'Contact',          path: '/contact' },
]

export default function Navbar() {
  const [openPath, setOpenPath] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const open = openPath === location.pathname

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
    >
      <div className="navbar__inner container">

        {/* Logo */}
       <Link to="/" className="navbar__logo">
  <motion.img
    src={logoWhite}
    alt="PayG Insure"
    className="navbar__logo-img"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
  />
</Link>

        {/* Desktop links */}
        <nav className="navbar__links" aria-label="Main navigation">
          {links.map(link => {
            const active = location.pathname === link.path
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`navbar__link ${active ? 'navbar__link--active' : ''}`}
              >
                {link.label}
                {active && (
                  <motion.span
                    className="navbar__link-underline"
                    layoutId="nav-underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop buttons */}
        <div className="navbar__actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="btn btn-teal btn-sm"
            onClick={() => navigate('/join')}
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setOpenPath(open ? null : location.pathname)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .2 }}><X size={22} /></motion.span>
              : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .2 }}><Menu size={22} /></motion.span>
            }
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: .35, ease: [.22, 1, .36, 1] }}
          >
            <div className="navbar__mobile-inner">
              {links.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * .06 + .1 }}
                >
                  <Link to={link.path} className="navbar__mobile-link">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="navbar__mobile-btns"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: .38 }}
              >
                <button
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button
                  className="btn btn-teal"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/join')}
                >
                  Get Started
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
