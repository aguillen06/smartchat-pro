'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

export default function OnboardingInstallPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tenantSlug, setTenantSlug] = useState('')
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant:tenants (id, slug)')
        .eq('auth_user_id', user.id)
        .single()

      if (userData?.tenant) {
        const tenant = Array.isArray(userData.tenant) ? userData.tenant[0] : userData.tenant
        setTenantSlug(tenant.slug)
        setTenantId(tenant.id)
      }
    }

    loadUserData()
  }, [supabase, router])

  const embedCode = `<!-- SmartChat Widget -->
<script>
  (function() {
    var sc = document.createElement('script');
    sc.src = 'https://smartchat.symtri.ai/widget.js';
    sc.async = true;
    sc.onload = function() {
      SmartChat.init({ tenantId: '${tenantSlug}' });
    };
    document.head.appendChild(sc);
  })();
</script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleComplete = async () => {
    setLoading(true)

    if (tenantId) {
      // Mark onboarding as complete
      await supabase
        .from('tenants')
        .update({
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', tenantId)
    }

    router.push('/dashboard')
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

        .success-banner {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        .success-banner .icon {
          width: 48px;
          height: 48px;
          background: #10B981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .success-banner h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          color: #166534;
          margin-bottom: 0.5rem;
        }
        .success-banner p {
          color: #15803D;
          font-size: 0.9rem;
        }

        .code-section {
          margin-bottom: 2rem;
        }
        .code-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #18181B;
          margin-bottom: 0.5rem;
        }
        .code-section p {
          color: #52525B;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .code-block {
          background: #1F2937;
          border-radius: 8px;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        .code-block pre {
          color: #E5E7EB;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #374151;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .copy-btn:hover {
          background: #4B5563;
        }
        .copy-btn.copied {
          background: #10B981;
        }

        .instructions {
          background: #F9FAFB;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .instructions h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #18181B;
          margin-bottom: 1rem;
        }
        .instructions ol {
          margin: 0;
          padding-left: 1.25rem;
          color: #52525B;
          font-size: 0.9rem;
        }
        .instructions li {
          margin-bottom: 0.5rem;
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

        .help-text {
          text-align: center;
          margin-top: 1rem;
          color: #71717A;
          font-size: 0.85rem;
        }
        .help-text a {
          color: #10B981;
          text-decoration: none;
        }
        .help-text a:hover {
          text-decoration: underline;
        }
      `}</style>

      <h1>Install your chat widget</h1>
      <p className="subtitle">Add SmartChat to your website with one line of code.</p>

      <div className="success-banner">
        <div className="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2>Your chatbot is ready!</h2>
        <p>Copy the code below and add it to your website.</p>
      </div>

      <div className="form-card">
        <div className="code-section">
          <h3>Embed Code</h3>
          <p>Add this code before the closing <code>&lt;/body&gt;</code> tag on every page.</p>

          <div className="code-block">
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre>{embedCode}</pre>
          </div>
        </div>

        <div className="instructions">
          <h4>How to install</h4>
          <ol>
            <li>Copy the code above</li>
            <li>Open your website's HTML or CMS</li>
            <li>Paste the code before <code>&lt;/body&gt;</code></li>
            <li>Save and publish your changes</li>
          </ol>
        </div>

        <button
          className="btn-primary"
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? 'Completing...' : 'Go to Dashboard'}
        </button>

        <p className="help-text">
          Need help? <a href="mailto:support@symtri.ai">Contact support</a> or <a href="https://calendly.com/symtri-ai/30min" target="_blank" rel="noopener noreferrer">schedule a call</a>
        </p>
      </div>
    </div>
  )
}
