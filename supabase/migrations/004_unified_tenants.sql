-- Migration: Create unified tenants table
-- This table is the foundation for multi-tenant architecture across SmartChat, PhoneBot, and Automation Hub

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  website_url TEXT,
  phone VARCHAR(50),
  stripe_customer_id TEXT UNIQUE,
  products JSONB DEFAULT '{"smartchat": false, "phonebot": false}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  language VARCHAR(10) DEFAULT 'en',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'trial', 'active', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe ON public.tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their own tenant
CREATE POLICY "Tenants are viewable by linked users" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS policy: Users can update their own tenant
CREATE POLICY "Tenants are updatable by linked users" ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_tenants_updated_at ON public.tenants;
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE public.tenants IS 'Multi-tenant organizations for Symtri AI ecosystem (SmartChat, PhoneBot, Automation Hub)';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier used in widget embed codes';
COMMENT ON COLUMN public.tenants.products IS 'JSON object tracking which products are enabled: {"smartchat": true, "phonebot": false}';
COMMENT ON COLUMN public.tenants.status IS 'Account status: pending (signup not complete), trial, active, suspended, cancelled';
