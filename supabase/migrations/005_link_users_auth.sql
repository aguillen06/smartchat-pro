-- Migration: Link users table to Supabase Auth and tenants
-- This migration adds columns to connect the existing users table with Supabase Auth and the new tenants table

-- Add new columns to users table (if not exist)
DO $$
BEGIN
  -- Add auth_user_id column linking to Supabase Auth
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_user_id') THEN
    ALTER TABLE public.users ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add tenant_id column linking to tenants
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.users ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- Add role column for future multi-user support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role VARCHAR(50) DEFAULT 'owner';
  END IF;

  -- Add first_name and last_name columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE public.users ADD COLUMN first_name VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE public.users ADD COLUMN last_name VARCHAR(100);
  END IF;

  -- Add updated_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_auth ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- RLS: Users can only read their own record
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- RLS: Users can update their own record
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow service role full access (for webhook operations)
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON COLUMN public.users.auth_user_id IS 'References Supabase Auth user ID';
COMMENT ON COLUMN public.users.tenant_id IS 'References the tenant/organization this user belongs to';
COMMENT ON COLUMN public.users.role IS 'User role within tenant: owner, admin, member';
