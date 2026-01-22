-- Migration: Add tenant_id to subscriptions table
-- Links subscriptions to tenants for multi-product billing

-- Add tenant_id column to subscriptions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  -- Add product column to track which product this subscription is for
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'product') THEN
    ALTER TABLE public.subscriptions ADD COLUMN product VARCHAR(50) DEFAULT 'smartchat';
  END IF;
END $$;

-- Create index for tenant lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product ON public.subscriptions(product);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- RLS: Users can only read subscriptions for their tenant
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- Allow service role full access (for webhook operations)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON COLUMN public.subscriptions.tenant_id IS 'References the tenant this subscription belongs to';
COMMENT ON COLUMN public.subscriptions.product IS 'Which product this subscription is for: smartchat, phonebot, etc.';
