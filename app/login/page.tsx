'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          color: #3F3F46;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-container {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          margin: 20px;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #18181B;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #18181B;
        }
        .logo-tagline {
          font-size: 0.8rem;
          color: #71717A;
          margin-top: 4px;
        }

        .page-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #18181B;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .page-subtitle {
          color: #52525B;
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #18181B;
          font-size: 0.9rem;
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

        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          background: #18181B;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.5rem;
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

        .links-section {
          margin-top: 1.5rem;
          text-align: center;
        }
        .links-section a {
          color: #18181B;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .links-section a:hover {
          text-decoration: underline;
        }
        .links-divider {
          color: #D4D4D8;
          margin: 0 0.75rem;
        }

        .signup-prompt {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E4E4E7;
          text-align: center;
          font-size: 0.9rem;
          color: #52525B;
        }
        .signup-prompt a {
          color: #18181B;
          text-decoration: none;
          font-weight: 600;
        }
        .signup-prompt a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-container">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="logo-text">SMARTCHAT</div>
          <div className="logo-tagline">By Symtri AI</div>
        </div>

        <h1 className="page-title">Welcome Back</h1>
        <p className="page-subtitle">Sign in to access your dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="links-section">
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <div className="signup-prompt">
          Don&apos;t have an account? <a href="/signup">Get started</a>
        </div>
      </div>
    </div>
  )
}
