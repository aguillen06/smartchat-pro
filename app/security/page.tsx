import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Compliance - SmartChat | Symtri AI',
  description: 'SmartChat security overview: 256-bit encryption, SOC 2 aligned infrastructure, HIPAA-ready. Your conversations are never used to train AI.',
}

export default function SecurityPage() {
  return (
    <div className="security-page">
      <style>{`
        .security-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FFFFFF;
          color: #3F3F46;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        .security-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
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
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { text-decoration: none; color: #52525B; font-size: 0.95rem; font-weight: 500; }
        .nav-links a:hover { color: #18181B; }

        .hero {
          padding: 8rem 2rem 4rem;
          background: #FAFAFA;
          text-align: center;
        }
        .hero-content { max-width: 800px; margin: 0 auto; }
        .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(24, 24, 27, 0.1);
          color: #18181B;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #18181B;
          margin-bottom: 1rem;
        }
        .hero p { font-size: 1.25rem; color: #52525B; max-width: 600px; margin: 0 auto; }

        .content { max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; }
        .section { margin-bottom: 4rem; }
        .section h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          color: #18181B;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #18181B;
          display: inline-block;
        }
        .section p { margin-bottom: 1rem; color: #3F3F46; }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .card {
          background: #FAFAFA;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 1.5rem;
        }
        .card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem;
          color: #18181B;
          margin-bottom: 0.75rem;
        }
        .card p { color: #52525B; font-size: 0.95rem; margin: 0; }

        .table-wrapper { overflow-x: auto; margin-top: 1.5rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        th, td { text-align: left; padding: 1rem; border-bottom: 1px solid #E4E4E7; }
        th { background: #FAFAFA; font-weight: 600; color: #18181B; }
        td { color: #3F3F46; }
        .check { color: #18181B; font-weight: 600; }

        .trust-badges { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem; justify-content: center; }
        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #3F3F46;
        }

        .cta-section {
          background: #18181B;
          padding: 4rem 2rem;
          text-align: center;
          color: #FFFFFF;
        }
        .cta-section h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; margin-bottom: 1rem; }
        .cta-section p { color: #A1A1AA; margin-bottom: 2rem; }
        .cta-section a {
          display: inline-block;
          padding: 1rem 2rem;
          background: #18181B;
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }
        .cta-section a:hover { background: #09090B; }

        footer {
          background: #000000;
          color: #A1A1AA;
          padding: 2rem;
          text-align: center;
          font-size: 0.875rem;
        }
        footer a { color: #A1A1AA; text-decoration: none; }
        footer a:hover { color: #18181B; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .cards-grid { grid-template-columns: 1fr; }
          .hero { padding: 6rem 1.5rem 3rem; }
          .hero h1 { font-size: 1.75rem; }
          .hero p { font-size: 1rem; }
          .content { padding: 2rem 1.5rem; }
          .section { margin-bottom: 2.5rem; }
          .section h2 { font-size: 1.4rem; }
          .cta-section { padding: 3rem 1.5rem; }
          .cta-section h2 { font-size: 1.5rem; }
          .trust-badges { gap: 0.75rem; }
          .trust-badge { font-size: 0.75rem; padding: 0.5rem 1rem; }
          .header { padding: 0.75rem 1rem; }
        }
      `}</style>

      <header className="header">
        <nav className="nav">
          <a href="/" className="logo">
            <span className="logo-text">SMARTCHAT</span>
            <span className="logo-tagline">By Symtri AI</span>
          </a>
          <ul className="nav-links">
            <li><a href="/">SmartChat</a></li>
            <li><a href="https://symtri.ai">Symtri AI</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="badge">SECURITY</div>
          <h1>Enterprise Security. Built for SMBs.</h1>
          <p>Your customer conversations deserve the same protection as Fortune 500 companies. Here&apos;s how we keep your data safe.</p>
        </div>
      </section>

      <div className="content">
        <section className="section">
          <h2>Encryption</h2>
          <p>All data is encrypted using industry-standard protocols, whether in transit or at rest.</p>
          <div className="cards-grid">
            <div className="card">
              <h3>Data at Rest</h3>
              <p>AES-256 encryption for all stored data including conversations, knowledge base, and customer information.</p>
            </div>
            <div className="card">
              <h3>Data in Transit</h3>
              <p>TLS 1.3 encryption for all API calls, webhooks, and widget communications.</p>
            </div>
            <div className="card">
              <h3>Credentials</h3>
              <p>Passwords hashed with bcrypt. API keys encrypted. No secrets stored in plain text.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Zero AI Training</h2>
          <p>Your conversations are private and never used to improve AI models.</p>
          <div className="cards-grid">
            <div className="card">
              <h3>Never Used for Training</h3>
              <p>Your customer conversations are never used to train AI models. Your data stays yours.</p>
            </div>
            <div className="card">
              <h3>Private by Design</h3>
              <p>Anthropic (Claude AI) does not use API conversations for training. Your data is processed but never retained.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Data Isolation</h2>
          <p>Every customer&apos;s data is completely isolated at the database level using Row-Level Security (RLS).</p>
          <div className="cards-grid">
            <div className="card">
              <h3>Multi-Tenant Security</h3>
              <p>Database-enforced tenant isolation. Customer A cannot access Customer B&apos;s data under any circumstance.</p>
            </div>
            <div className="card">
              <h3>Complete Separation</h3>
              <p>Separate encryption keys per tenant. Your knowledge base and conversations are completely isolated.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Compliance</h2>
          <p>Our infrastructure is built to meet the requirements of regulated industries.</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SOC 2</strong></td>
                  <td className="check">Aligned</td>
                  <td>Infrastructure providers (Vercel, Supabase) are SOC 2 Type II certified</td>
                </tr>
                <tr>
                  <td><strong>HIPAA</strong></td>
                  <td className="check">Available</td>
                  <td>Business Associate Agreement available for healthcare clients</td>
                </tr>
                <tr>
                  <td><strong>GDPR</strong></td>
                  <td className="check">Compliant</td>
                  <td>Data residency options, right to deletion, data portability</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>Infrastructure</h2>
          <p>We use best-in-class infrastructure providers with proven security track records.</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Certifications</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Vercel</strong></td>
                  <td>Application Hosting</td>
                  <td>SOC 2 Type II, ISO 27001</td>
                </tr>
                <tr>
                  <td><strong>Supabase</strong></td>
                  <td>Database</td>
                  <td>SOC 2 Type II, HIPAA eligible</td>
                </tr>
                <tr>
                  <td><strong>Anthropic</strong></td>
                  <td>AI (Claude)</td>
                  <td>SOC 2 Type II, No Data Training</td>
                </tr>
                <tr>
                  <td><strong>Stripe</strong></td>
                  <td>Payments</td>
                  <td>PCI DSS Level 1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>Your Data, Your Control</h2>
          <p>You maintain full control over your data at all times.</p>
          <div className="cards-grid">
            <div className="card">
              <h3>Export Anytime</h3>
              <p>Download all your conversation data, knowledge base, and analytics whenever you need.</p>
            </div>
            <div className="card">
              <h3>Delete on Request</h3>
              <p>Request complete data deletion at any time. We&apos;ll remove everything within 72 hours.</p>
            </div>
            <div className="card">
              <h3>Transparent Processing</h3>
              <p>We only process data necessary to provide the service. No hidden data collection.</p>
            </div>
          </div>
        </section>

        <div className="trust-badges">
          <span className="trust-badge">256-bit Encrypted</span>
          <span className="trust-badge">SOC 2 Aligned</span>
          <span className="trust-badge">No AI Training</span>
          <span className="trust-badge">HIPAA Available</span>
        </div>
      </div>

      <section className="cta-section">
        <h2>Questions About Security?</h2>
        <p>Contact our team for security documentation, compliance questionnaires, or custom requirements.</p>
        <a href="mailto:security@symtri.ai">Contact Security Team</a>
      </section>

      <footer>
        <p>&copy; 2025 Symtri AI. All rights reserved. | <a href="/">Back to SmartChat</a> | <a href="https://symtri.ai">Symtri AI</a></p>
      </footer>
    </div>
  )
}
