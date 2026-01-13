'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      setHasSession(!!session)
      setSessionChecked(true)
    }
    checkSession()

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true)
      } else if (session) {
        setHasSession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabaseBrowser.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <div style={{ color: '#52525B' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="reset-page">
      <style>{`
        .reset-page {
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
        .reset-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .reset-container {
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
          background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
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
          border-color: #10B981;
        }

        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          background: #10B981;
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
          background: #059669;
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

        .invalid-link {
          text-align: center;
          padding: 2rem;
        }
        .invalid-link h3 {
          font-size: 1.1rem;
          color: #DC2626;
          margin-bottom: 0.75rem;
        }
        .invalid-link p {
          color: #52525B;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        .invalid-link a {
          color: #10B981;
          text-decoration: none;
          font-weight: 500;
        }
        .invalid-link a:hover {
          text-decoration: underline;
        }

        .back-link {
          margin-top: 1.5rem;
          text-align: center;
        }
        .back-link a {
          color: #10B981;
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

      <div className="reset-container">
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
            <h3>Password Updated</h3>
            <p>Your password has been reset successfully. Redirecting to dashboard...</p>
          </div>
        ) : !hasSession ? (
          <div className="invalid-link">
            <h3>Invalid or Expired Link</h3>
            <p>This password reset link is invalid or has expired.</p>
            <a href="/forgot-password">Request a new reset link</a>
          </div>
        ) : (
          <>
            <h1 className="page-title">Set New Password</h1>
            <p className="page-subtitle">Enter your new password below</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  autoFocus
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
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
