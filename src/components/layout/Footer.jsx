import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import logoWhite from '../../assets/logo-white.png'
import './Footer.css'

const cols = {
  Company: [
    { label: 'About Us',         path: '/about' },
    { label: 'Insurance Plans',  path: '/plans' },
    { label: 'For Cooperatives', path: '/plans' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
  ],
  Support: [
    { label: 'Help Center',      path: '/help' },
    { label: 'FAQs',             path: '/faqs' },
    { label: 'Partner Insurers', path: '/partners' },
  ],
}

const socials = [
  { label: 'Twitter',   href: '#', symbol: 'X'  },
  { label: 'Facebook',  href: '#', symbol: 'f'  },
  { label: 'Instagram', href: '#', symbol: 'In' },
  { label: 'LinkedIn',  href: '#', symbol: 'Li' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">

          {/* Brand column */}
          <div className="footer__brand">
           <Link to="/" className="footer__logo">
    <img
    src={logoWhite}
    alt="PayG Insure"
    className="footer__logo-img"
  />
</Link>
            <p className="footer__tagline">
              Flexible insurance access for individuals, cooperatives, and trade unions across Africa.
            </p>
            <div className="footer__contact">
              <span><Mail size={13} /> hello@payginsure.com</span>
              <span><Phone size={13} /> +234 800 000 0000</span>
              <span><MapPin size={13} /> Lagos, Nigeria</span>
            </div>
            <div className="footer__socials">
              {socials.map(s => (
  <motion.a
    key={s.label} href={s.href}
    aria-label={s.label}
    className="footer__social"
    whileHover={{ y: -3, scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 400 }}
  >
    <span style={{ fontSize: '.7rem', fontWeight: 700 }}>{s.symbol}</span>
  </motion.a>
))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([heading, items]) => (
            <div key={heading} className="footer__col">
              <h4 className="footer__col-heading">{heading}</h4>
              <ul className="footer__col-links">
                {items.map(item => (
                  <li key={item.label}>
                    {item.external ? <a href={item.path} className="footer__col-link">
                      {item.label}
                    </a> : <Link to={item.path} className="footer__col-link">
                      {item.label}
                    </Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} PayG Insure. All rights reserved.</p>
          <p>Built for Africa. Designed for flexibility.</p>
        </div>
      </div>
    </footer>
  )
}
