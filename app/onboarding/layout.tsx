'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { path: '/onboarding/business', label: 'Business Details', number: 1 },
  { path: '/onboarding/knowledge', label: 'Add Knowledge', number: 2 },
  { path: '/onboarding/widget', label: 'Customize Widget', number: 3 },
  { path: '/onboarding/install', label: 'Install Widget', number: 4 },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentStepIndex = STEPS.findIndex(step => pathname.startsWith(step.path))

  return (
    <div className="onboarding-layout">
      <style>{`
        .onboarding-layout {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          min-height: 100vh;
          color: #3F3F46;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        .onboarding-layout * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .progress-container {
          background: #FFFFFF;
          border-bottom: 1px solid #E4E4E7;
          padding: 1.5rem 2rem;
        }

        .progress-steps {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          position: relative;
        }

        .progress-steps::before {
          content: '';
          position: absolute;
          top: 16px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: #E4E4E7;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          background: #E4E4E7;
          color: #71717A;
          margin-bottom: 0.5rem;
        }

        .step.completed .step-indicator {
          background: #10B981;
          color: white;
        }

        .step.active .step-indicator {
          background: #10B981;
          color: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .step-label {
          font-size: 0.8rem;
          color: #71717A;
          text-align: center;
          max-width: 100px;
        }

        .step.completed .step-label,
        .step.active .step-label {
          color: #18181B;
          font-weight: 500;
        }

        .content {
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        @media (max-width: 640px) {
          .progress-steps {
            gap: 0.5rem;
          }
          .step-label {
            font-size: 0.7rem;
            max-width: 70px;
          }
          .progress-steps::before {
            left: 20px;
            right: 20px;
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

      <div className="progress-container">
        <div className="progress-steps">
          {STEPS.map((step, index) => (
            <div
              key={step.path}
              className={`step ${index < currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'active' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStepIndex ? '✓' : step.number}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  )
}
