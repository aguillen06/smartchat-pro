'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

const WIDGET_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
]

const DEFAULT_COLORS = [
  '#10B981', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
]

export default function OnboardingWidgetPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [businessName, setBusinessName] = useState('')

  // Widget settings
  const [primaryColor, setPrimaryColor] = useState('#10B981')
  const [position, setPosition] = useState('bottom-right')
  const [greeting, setGreeting] = useState('')
  const [placeholder, setPlaceholder] = useState('Type your message...')

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant:tenants (id, business_name, settings)')
        .eq('auth_user_id', user.id)
        .single()

      if (userData?.tenant) {
        const tenant = Array.isArray(userData.tenant) ? userData.tenant[0] : userData.tenant
        setTenantId(tenant.id)
        setBusinessName(tenant.business_name || '')

        // Load existing widget settings
        if (tenant.settings?.widget) {
          const ws = tenant.settings.widget
          if (ws.primaryColor) setPrimaryColor(ws.primaryColor)
          if (ws.position) setPosition(ws.position)
          if (ws.greeting) setGreeting(ws.greeting)
          if (ws.placeholder) setPlaceholder(ws.placeholder)
        }

        // Set default greeting
        if (!tenant.settings?.widget?.greeting) {
          setGreeting(`Hi! I'm ${tenant.business_name || 'your'} AI assistant. How can I help you today?`)
        }
      }
    }

    loadUserData()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!tenantId) {
      setError('Session error. Please refresh and try again.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/onboarding/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          settings: {
            primaryColor,
            position,
            greeting,
            placeholder,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to save settings.')
        setLoading(false)
        return
      }

      router.push('/onboarding/install')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-step">
      <style>{`
        .onboarding-step h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #18181B;
          margin-bottom: 0.5rem;
        }
        .onboarding-step p.subtitle {
          color: #52525B;
          margin-bottom: 2rem;
        }

        .widget-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }

        .form-card {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 2rem;
        }

        .preview-card {
          background: #F4F4F5;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 1.5rem;
          position: sticky;
          top: 2rem;
        }

        .preview-title {
          font-weight: 600;
          color: #18181B;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #18181B;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .form-group textarea {
          min-height: 80px;
          resize: vertical;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .color-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .color-option {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .color-option:hover {
          transform: scale(1.1);
        }
        .color-option.selected {
          border-color: #18181B;
          box-shadow: 0 0 0 2px white, 0 0 0 4px #18181B;
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

        .btn-primary {
          width: 100%;
          padding: 1rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background: #059669;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Widget Preview */
        .widget-preview {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .widget-header {
          padding: 1rem;
          color: white;
        }
        .widget-header h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
        }

        .widget-body {
          padding: 1rem;
          background: #F9FAFB;
          min-height: 100px;
        }

        .widget-greeting {
          background: #E5E7EB;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #374151;
        }

        .widget-input {
          padding: 1rem;
          border-top: 1px solid #E5E7EB;
          display: flex;
          gap: 0.5rem;
        }
        .widget-input input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 0.8rem;
        }
        .widget-input button {
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.8rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .widget-grid {
            grid-template-columns: 1fr;
          }
          .preview-card {
            order: -1;
          }
        }
      `}</style>

      <h1>Customize your chat widget</h1>
      <p className="subtitle">Make it match your brand and greet your visitors.</p>

      <div className="widget-grid">
        <div className="form-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Brand Color</label>
              <div className="color-options">
                {DEFAULT_COLORS.map(color => (
                  <div
                    key={color}
                    className={`color-option ${primaryColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setPrimaryColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="position">Widget Position</label>
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {WIDGET_POSITIONS.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="greeting">Welcome Message</label>
              <textarea
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Hi! How can I help you today?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="placeholder">Input Placeholder</label>
              <input
                type="text"
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Type your message..."
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>

        <div className="preview-card">
          <div className="preview-title">Widget Preview</div>
          <div className="widget-preview">
            <div className="widget-header" style={{ backgroundColor: primaryColor }}>
              <h3>{businessName || 'Your Business'}</h3>
            </div>
            <div className="widget-body">
              <div className="widget-greeting">
                {greeting || "Hi! How can I help you today?"}
              </div>
            </div>
            <div className="widget-input">
              <input type="text" placeholder={placeholder} disabled />
              <button style={{ backgroundColor: primaryColor }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
