import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'

import './Auth.css'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [form,   setForm  ] = useState({ phone: '', password: '' })
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <PageWrapper>
      <div className="auth-page">

        <div className="auth-page__left">
          <div className="auth-page__left-inner">

            <div className="auth-logo">
              <div className="auth-logo__icon">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <span className="auth-logo__text">PayG<span>Insure</span></span>
            </div>

            <h2 className="auth-form-heading">Welcome Back</h2>
            <p className="auth-form-sub">Sign in to your PayG Insure account.</p>

            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <div className="form-group auth-pw-group">
                <label className="form-label">Password / PIN</label>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-.25rem' }}>
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: '.875rem' }}>
                  Forgot password?
                </Link>
              </div>

              <motion.button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: .97 }}
              >
                Login <ArrowRight size={16} />
              </motion.button>

              <div className="auth-divider"><span>or</span></div>

              <button className="btn btn-outline-primary" style={{ width: '100%' }}>
                Login with PayG ID
              </button>
            </div>

            <p className="auth-page__footer-text">
              No account?{' '}
              <button className="auth-link" onClick={() => navigate('/join')}>Sign up</button>
            </p>
          </div>
        </div>

        <div className="auth-page__right">
          <div className="auth-page__right-inner">
            <blockquote className="auth-quote">
              <p>"Your coverage. Your terms. Your timeline."</p>
              <cite>— PayG Insure</cite>
            </blockquote>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
