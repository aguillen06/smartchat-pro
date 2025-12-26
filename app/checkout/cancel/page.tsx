import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout Cancelled - SmartChat',
}

export default function CheckoutCancelPage() {
  return (
    <div className="cancel-page">
      <style>{`
        .cancel-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          -webkit-font-smoothing: antialiased;
        }
        .cancel-page * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .icon-cancel {
          width: 80px;
          height: 80px;
          background: rgba(161, 161, 170, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .icon-cancel svg {
          width: 40px;
          height: 40px;
          stroke: #71717A;
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

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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

        .btn-secondary {
          display: inline-block;
          padding: 1rem 2rem;
          background: transparent;
          color: #52525B;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          border: 1px solid #E4E4E7;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: #18181B;
          color: #18181B;
        }

        .help-text {
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #71717A;
        }
        .help-text a {
          color: #10B981;
          text-decoration: none;
        }
        .help-text a:hover {
          text-decoration: underline;
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
          <div className="icon-cancel">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>

          <h1>Checkout Cancelled</h1>
          <p>
            No worries! Your checkout was cancelled and you haven&apos;t been charged.
            Ready to try again when you are.
          </p>

          <div className="buttons">
            <a href="/signup" className="btn-primary">
              Try Again
            </a>
            <a href="/#pricing" className="btn-secondary">
              View Pricing
            </a>
          </div>

          <p className="help-text">
            Have questions? <a href="mailto:hello@symtri.ai">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}
