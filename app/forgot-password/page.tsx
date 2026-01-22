'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <style>{`
        .forgot-page {
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
        .forgot-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .forgot-container {
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
          background: linear-gradient(135deg, #18181B 0%, #18181B 100%);
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

        .success-message {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #166534;
          padding: 1.25rem;
          border-radius: 8px;
          text-align: center;
        }
        .success-message h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .success-message p {
          font-size: 0.9rem;
          color: #15803D;
        }

        .back-link {
          margin-top: 1.5rem;
          text-align: center;
        }
        .back-link a {
          color: #18181B;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .back-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="forgot-container">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="logo-text">SMARTCHAT</div>
          <div className="logo-tagline">By Symtri AI</div>
        </div>

        {success ? (
          <div className="success-message">
            <h3>Check your email</h3>
            <p>We sent a password reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h1 className="page-title">Reset Password</h1>
            <p className="page-subtitle">Enter your email and we&apos;ll send you a reset link</p>

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

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div className="back-link">
          <a href="/login">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to login
          </a>
        </div>
      </div>
    </div>
  )
}
