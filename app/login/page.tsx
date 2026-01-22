'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const supabase = createBrowserSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setResetEmailSent(true)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: #3F3F46;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        .login-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .header {
          padding: 1rem 2rem;
          background: #FFFFFF;
          border-bottom: 1px solid #E4E4E7;
        }
        .nav {
          max-width: 1200px;
          margin: 0 auto;
        }
        .logo { text-decoration: none; color: #18181B; }
        .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700; }
        .logo-tagline { display: block; font-size: 0.7rem; color: #71717A; letter-spacing: 0.1em; text-transform: uppercase; }

        .content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-card {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #18181B;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: #52525B;
          font-size: 0.95rem;
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
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #18181B;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
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

        .success-message {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #16A34A;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .btn-primary {
          width: 100%;
          padding: 0.875rem 1rem;
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

        .forgot-password {
          text-align: right;
          margin-bottom: 1.5rem;
        }
        .forgot-password button {
          background: none;
          border: none;
          color: #18181B;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: underline;
        }
        .forgot-password button:hover {
          color: #09090B;
        }

        .signup-link {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E4E4E7;
          color: #52525B;
          font-size: 0.9rem;
        }
        .signup-link a {
          color: #18181B;
          text-decoration: none;
          font-weight: 500;
        }
        .signup-link a:hover {
          text-decoration: underline;
        }

        .back-link {
          margin-bottom: 1.5rem;
        }
        .back-link button {
          background: none;
          border: none;
          color: #52525B;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .back-link button:hover {
          color: #18181B;
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
        <div className="login-card">
          {showForgotPassword ? (
            <>
              <div className="back-link">
                <button onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setError(''); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to login
                </button>
              </div>

              <div className="login-header">
                <h1>Reset Password</h1>
                <p>Enter your email to receive a reset link</p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {resetEmailSent && (
                <div className="success-message">
                  Check your email for a password reset link.
                </div>
              )}

              {!resetEmailSent && (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                      type="email"
                      id="reset-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="login-header">
                <h1>Welcome Back</h1>
                <p>Sign in to your SmartChat dashboard</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleLogin}>
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
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="forgot-password">
                  <button type="button" onClick={() => setShowForgotPassword(true)}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="signup-link">
                Don't have an account? <a href="/signup">Start free trial</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAFA' }} />}>
      <LoginForm />
    </Suspense>
  )
}
