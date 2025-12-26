'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Brief delay to show loading state
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="success-page">
      <style>{`
        .success-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          -webkit-font-smoothing: antialiased;
        }
        .success-page * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .card {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .icon-success {
          width: 80px;
          height: 80px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .icon-success svg {
          width: 40px;
          height: 40px;
          stroke: #10B981;
          stroke-width: 2;
          fill: none;
        }

        .card h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #18181B;
          margin-bottom: 0.75rem;
        }

        .card p {
          color: #52525B;
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .btn-primary {
          display: inline-block;
          padding: 1rem 2rem;
          background: #10B981;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #059669;
        }

        .next-steps {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #E4E4E7;
          text-align: left;
        }
        .next-steps h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #18181B;
        }
        .next-steps ul {
          list-style: none;
        }
        .next-steps li {
          padding: 0.5rem 0;
          color: #52525B;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .step-number {
          width: 24px;
          height: 24px;
          background: #10B981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #E4E4E7;
          border-top-color: #10B981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
        <div className="card">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Completing your signup...</p>
            </div>
          ) : (
            <>
              <div className="icon-success">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h1>Welcome to SmartChat!</h1>
              <p>
                Your account has been created and your subscription is active.
                You&apos;re ready to start capturing leads 24/7.
              </p>

              <a href="/dashboard" className="btn-primary">
                Go to Dashboard
              </a>

              <div className="next-steps">
                <h2>Next Steps</h2>
                <ul>
                  <li>
                    <span className="step-number">1</span>
                    Add your business information and knowledge base
                  </li>
                  <li>
                    <span className="step-number">2</span>
                    Customize your chatbot&apos;s greeting and style
                  </li>
                  <li>
                    <span className="step-number">3</span>
                    Copy the widget code to your website
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAFA' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
