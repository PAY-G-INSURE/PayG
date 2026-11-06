import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import './ProductChoicePage.css'

const products = [
  {
    id: 'health',
    title: 'Health Insurance',
    description: 'Explore health plans and manage your health cover.',
    icon: Heart,
  },
  {
    id: 'life',
    title: 'Life Insurance',
    description: 'Financial protection for the people who matter to you.',
    icon: ShieldCheck,
  },
]

export default function ProductChoicePage() {
  const [selected, setSelected] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  function continueToProduct() {
    if (selected === 'health') {
      window.location.assign('/health-insurance/auth')
      return
    }
    if (selected === 'life') {
      setNotice('Life Insurance is coming soon. You can sign in to Health Insurance now.')
    }
  }

  return (
    <PageWrapper>
      <main className="product-choice">
        <div className="product-choice__glow" aria-hidden="true" />
        <motion.div
          className="product-choice__content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="product-choice__eyebrow">WELCOME TO PAYG</p>
          <h1>Which insurance would you like to access?</h1>
          <p className="product-choice__intro">Choose a product to continue. Health Insurance is available now; Life Insurance is coming soon.</p>

          <div className="product-choice__grid" role="radiogroup" aria-label="Choose an insurance product">
            {products.map(({ id, title, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`product-choice__card ${selected === id ? 'product-choice__card--selected' : ''}`}
                role="radio"
                aria-checked={selected === id}
                onClick={() => { setSelected(id); setNotice('') }}
              >
                <span className="product-choice__icon"><Icon size={25} /></span>
                <span className="product-choice__title">{title}</span>
                <span className="product-choice__description">{description}</span>
                {id === 'life' && <span className="product-choice__badge">Coming soon</span>}
              </button>
            ))}
          </div>

          {notice && <p className="product-choice__notice" role="status">{notice}</p>}

          <button
            type="button"
            className="product-choice__continue"
            disabled={!selected}
            onClick={continueToProduct}
          >
            Continue <ArrowRight size={18} />
          </button>
          <button type="button" className="product-choice__back" onClick={() => navigate('/')}>Back to PayG home</button>
        </motion.div>
      </main>
    </PageWrapper>
  )
}
