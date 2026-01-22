'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

const BUSINESS_TYPES = [
  'Professional Services',
  'Healthcare / Medical',
  'Home Services',
  'Retail / E-commerce',
  'Restaurant / Food Service',
  'Real Estate',
  'Legal Services',
  'Financial Services',
  'Education',
  'Other',
]

export default function OnboardingBusinessPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantId, setTenantId] = useState('')

  // Form fields
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    // Load current user and tenant data
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch user's tenant data
      const { data: userData } = await supabase
        .from('users')
        .select(`
          tenant:tenants (
            id,
            business_name,
            business_type,
            website_url,
            phone
          )
        `)
        .eq('auth_user_id', user.id)
        .single()

      if (userData?.tenant) {
        const tenant = Array.isArray(userData.tenant) ? userData.tenant[0] : userData.tenant
        setTenantId(tenant.id)
        setBusinessName(tenant.business_name || '')
        setBusinessType(tenant.business_type || '')
        setWebsiteUrl(tenant.website_url || '')
        setPhone(tenant.phone || '')
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

    // Update tenant with business details
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        business_name: businessName,
        business_type: businessType,
        website_url: websiteUrl || null,
        phone: phone || null,
      })
      .eq('id', tenantId)

    if (updateError) {
      setError('Failed to save. Please try again.')
      setLoading(false)
      return
    }

    // Move to next step
    router.push('/onboarding/knowledge')
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
        .form-group select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #E4E4E7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
        }
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-group small {
          display: block;
          margin-top: 0.25rem;
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
      `}</style>

      <h1>Tell us about your business</h1>
      <p className="subtitle">This helps us customize SmartChat for your needs.</p>

      <div className="form-card">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessType">Business Type</label>
            <select
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            >
              <option value="">Select your industry</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="websiteUrl">Website URL (optional)</label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourcompany.com"
            />
            <small>We can import FAQ content from your website</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Business Phone (optional)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
