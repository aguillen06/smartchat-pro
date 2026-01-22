'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

const PLANS = {
  starter: {
    name: 'Starter',
    price: 297,
    priceId: 'price_1Sj0bgLNymQzQ2SuoMYldDKh',
    features: ['1,000 conversations/mo', '1 website', 'Dashboard access', 'Email support'],
  },
  professional: {
    name: 'Professional',
    price: 397,
    priceId: 'price_1Sj0c7LNymQzQ2SuiTVptwPL',
    features: ['5,000 conversations/mo', '3 websites', 'Priority support', 'Chat analytics'],
  },
}

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'account' | 'payment'>('account')

  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan === 'starter' || plan === 'professional') {
      setSelectedPlan(plan)
    }
  }, [searchParams])

  // Generate slug from business name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36)
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // 1. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      // 2. Create tenant and user records via API (uses service role)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUserId: authData.user.id,
          email,
          businessName,
          slug: generateSlug(businessName),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Store tenant ID for checkout
      sessionStorage.setItem('signup_tenant_id', result.tenantId)

      // Move to payment step
      setStep('payment')
      setLoading(false)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const tenantId = sessionStorage.getItem('signup_tenant_id')

      if (!tenantId) {
        setError('Session expired. Please start over.')
        setStep('account')
        setLoading(false)
        return
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PLANS[selectedPlan].priceId,
          email,
          tenantId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <style>{`
        .signup-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          color: #3F3F46;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        .signup-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .header {
          padding: 1rem 2rem;
          background: #FFFFFF;
          border-bottom: 1px solid #E4E4E7;
        }
        .nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo { text-decoration: none; color: #18181B; }
        .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700; }
        .logo-tagline { display: block; font-size: 0.7rem; color: #71717A; letter-spacing: 0.1em; text-transform: uppercase; }

        .content {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .page-title {
          text-align: center;
          margin-bottom: 3rem;
        }
        .page-title h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #18181B;
          margin-bottom: 0.5rem;
        }
        .page-title p {
          color: #52525B;
          font-size: 1.1rem;
        }

        .steps-indicator {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #71717A;
        }
        .step-item.active {
          color: #18181B;
        }
        .step-item.completed {
          color: #18181B;
        }
        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          background: #E4E4E7;
          color: #71717A;
        }
        .step-item.active .step-number {
          background: #18181B;
          color: white;
        }
        .step-item.completed .step-number {
          background: #18181B;
          color: white;
        }

        .signup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .plan-selection h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #18181B;
        }

        .plan-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .plan-card {
          background: #FFFFFF;
          border: 2px solid #E4E4E7;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .plan-card:hover {
          border-color: #18181B;
        }
        .plan-card.selected {
          border-color: #18181B;
          background: rgba(24, 24, 27, 0.05);
        }
        .plan-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .plan-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: #18181B;
        }
        .plan-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #18181B;
        }
        .plan-price span {
          font-size: 0.875rem;
          font-weight: 400;
          color: #71717A;
        }
        .plan-features {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .plan-features li {
          font-size: 0.875rem;
          color: #52525B;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .plan-features li::before {
          content: '✓';
          color: #18181B;
          font-weight: 600;
        }
        .popular-tag {
          background: #18181B;
          color: white;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .signup-form-container {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 2rem;
        }
        .signup-form-container h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #18181B;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #18181B;
        }
        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #18181B;
        }
        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #71717A;
          font-size: 0.8rem;
        }

        .btn-primary {
          width: 100%;
          padding: 1rem;
          background: #18181B;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background: #09090B;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .summary {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E4E4E7;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .summary-total {
          font-weight: 600;
          font-size: 1.1rem;
          color: #18181B;
        }

        .secure-note {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #71717A;
        }
        .secure-note svg {
          width: 14px;
          height: 14px;
          vertical-align: middle;
          margin-right: 4px;
        }

        .login-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #52525B;
          font-size: 0.9rem;
        }
        .login-link a {
          color: #18181B;
          text-decoration: none;
        }
        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .signup-grid {
            grid-template-columns: 1fr;
          }
          .plan-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="header">
        <nav className="nav">
          <a href="/" className="logo">
            <span className="logo-text">SMARTCHAT</span>
            <span className="logo-tagline">By Symtri AI</span>
          </a>
        </nav>
      </header>

      <div className="content">
        <div className="page-title">
          <h1>Get Started with SmartChat</h1>
          <p>Start your 14-day free trial. No credit card required.</p>
        </div>

        <div className="steps-indicator">
          <div className={`step-item ${step === 'account' ? 'active' : 'completed'}`}>
            <span className="step-number">{step === 'payment' ? '✓' : '1'}</span>
            <span>Create Account</span>
          </div>
          <div className={`step-item ${step === 'payment' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span>Start Trial</span>
          </div>
        </div>

        <div className="signup-grid">
          <div className="plan-selection">
            <h2>Select Your Plan</h2>
            <div className="plan-cards">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`plan-card ${selectedPlan === key ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(key as 'starter' | 'professional')}
                >
                  <div className="plan-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="plan-name">{plan.name}</span>
                      {key === 'professional' && <span className="popular-tag">Popular</span>}
                    </div>
                    <span className="plan-price">${plan.price}<span>/mo</span></span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="signup-form-container">
            <h2>{step === 'account' ? 'Create Your Account' : 'Start Your Trial'}</h2>

            {error && <div className="error-message">{error}</div>}

            {step === 'account' ? (
              <form onSubmit={handleAccountSubmit}>
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Company Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={8}
                  />
                  <small>Must be at least 8 characters</small>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating account...' : 'Continue'}
                </button>

                <div className="login-link">
                  Already have an account? <a href="/login">Sign in</a>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePaymentSubmit}>
                <div className="summary">
                  <div className="summary-row">
                    <span>Business</span>
                    <span>{businessName}</span>
                  </div>
                  <div className="summary-row">
                    <span>Plan</span>
                    <span>{PLANS[selectedPlan].name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Trial Period</span>
                    <span>14 days free</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span>Then</span>
                    <span>${PLANS[selectedPlan].price}/mo</span>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? 'Starting checkout...' : 'Start Free Trial'}
                </button>

                <p className="secure-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Secure checkout powered by Stripe
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAFA' }} />}>
      <SignupForm />
    </Suspense>
  )
}
