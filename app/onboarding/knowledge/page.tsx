'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

export default function OnboardingKnowledgePage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [inputType, setInputType] = useState<'faq' | 'website'>('faq')

  // Form fields
  const [faqContent, setFaqContent] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant:tenants (id, website_url)')
        .eq('auth_user_id', user.id)
        .single()

      if (userData?.tenant) {
        const tenant = Array.isArray(userData.tenant) ? userData.tenant[0] : userData.tenant
        setTenantId(tenant.id)
        if (tenant.website_url) {
          setWebsiteUrl(tenant.website_url)
        }
      }
    }

    loadUserData()
  }, [supabase, router])

  const handleAddKnowledge = async () => {
    if (!tenantId) {
      setError('Session error. Please refresh and try again.')
      return
    }

    if (inputType === 'faq' && !faqContent.trim()) {
      setError('Please enter some FAQ content.')
      return
    }

    if (inputType === 'website' && !websiteUrl.trim()) {
      setError('Please enter a website URL.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/onboarding/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          type: inputType,
          content: inputType === 'faq' ? faqContent : websiteUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to add knowledge.')
        setLoading(false)
        return
      }

      setSuccess(`Successfully added ${result.chunksCreated} knowledge entries!`)
      if (inputType === 'faq') {
        setFaqContent('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push('/onboarding/widget')
  }

  const handleSkip = () => {
    router.push('/onboarding/widget')
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

        .form-card {
          background: #FFFFFF;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          padding: 2rem;
        }

        .input-type-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .toggle-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          border-color: #10B981;
        }
        .toggle-btn.active {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10B981;
          color: #059669;
          font-weight: 500;
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
          min-height: 200px;
          resize: vertical;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: #71717A;
          font-size: 0.8rem;
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

        .btn-secondary {
          width: 100%;
          padding: 1rem;
          background: white;
          color: #52525B;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.75rem;
        }
        .btn-secondary:hover {
          background: #F4F4F5;
        }

        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .actions button {
          flex: 1;
        }
      `}</style>

      <h1>Add knowledge to your chatbot</h1>
      <p className="subtitle">Help your AI assistant answer questions about your business.</p>

      <div className="form-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-type-toggle">
          <button
            className={`toggle-btn ${inputType === 'faq' ? 'active' : ''}`}
            onClick={() => setInputType('faq')}
            type="button"
          >
            Enter FAQ Text
          </button>
          <button
            className={`toggle-btn ${inputType === 'website' ? 'active' : ''}`}
            onClick={() => setInputType('website')}
            type="button"
          >
            Import from Website
          </button>
        </div>

        {inputType === 'faq' ? (
          <div className="form-group">
            <label htmlFor="faqContent">FAQ Content</label>
            <textarea
              id="faqContent"
              value={faqContent}
              onChange={(e) => setFaqContent(e.target.value)}
              placeholder={`Q: What are your business hours?\nA: We're open Monday through Friday, 9am to 5pm.\n\nQ: How do I schedule an appointment?\nA: You can schedule online at our website or call us at (555) 123-4567.`}
            />
            <small>Enter your FAQs in Q&A format. You can add more knowledge later.</small>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="websiteUrl">Website URL</label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourcompany.com"
            />
            <small>We'll extract FAQ and service information from your website.</small>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleAddKnowledge}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Add Knowledge'}
        </button>

        <div className="actions">
          <button className="btn-secondary" onClick={handleSkip}>
            Skip for now
          </button>
          <button className="btn-primary" onClick={handleContinue} style={{ marginTop: 0 }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
