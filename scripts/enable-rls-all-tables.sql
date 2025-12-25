-- Enable Row Level Security (RLS) on all tables
-- Run this in Supabase SQL Editor
--
-- This script addresses Supabase security warnings about RLS being disabled
-- All policies grant access to service_role which is used by the backend

-- ============================================
-- PUBLIC SCHEMA TABLES
-- ============================================

-- 1. public.customers
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to customers" ON public.customers;
CREATE POLICY "Service role full access to customers"
  ON public.customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. public.widgets
ALTER TABLE IF EXISTS public.widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to widgets" ON public.widgets;
CREATE POLICY "Service role full access to widgets"
  ON public.widgets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. public.conversations
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to conversations" ON public.conversations;
CREATE POLICY "Service role full access to conversations"
  ON public.conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. public.knowledge_docs
ALTER TABLE IF EXISTS public.knowledge_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to knowledge_docs" ON public.knowledge_docs;
CREATE POLICY "Service role full access to knowledge_docs"
  ON public.knowledge_docs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. public.messages
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to messages" ON public.messages;
CREATE POLICY "Service role full access to messages"
  ON public.messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. public.leads
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to leads" ON public.leads;
CREATE POLICY "Service role full access to leads"
  ON public.leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. public.tenants
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to tenants" ON public.tenants;
CREATE POLICY "Service role full access to tenants"
  ON public.tenants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. public.knowledge_chunks
ALTER TABLE IF EXISTS public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Service role full access to knowledge_chunks"
  ON public.knowledge_chunks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. public.phonebot_waitlist
ALTER TABLE IF EXISTS public.phonebot_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to phonebot_waitlist" ON public.phonebot_waitlist;
CREATE POLICY "Service role full access to phonebot_waitlist"
  ON public.phonebot_waitlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PHONEBOT SCHEMA TABLES
-- ============================================

-- 10. phonebot.tenant_configs
ALTER TABLE IF EXISTS phonebot.tenant_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to tenant_configs" ON phonebot.tenant_configs;
CREATE POLICY "Service role full access to tenant_configs"
  ON phonebot.tenant_configs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 11. phonebot.users
ALTER TABLE IF EXISTS phonebot.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to phonebot_users" ON phonebot.users;
CREATE POLICY "Service role full access to phonebot_users"
  ON phonebot.users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 12. phonebot.calls
ALTER TABLE IF EXISTS phonebot.calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to phonebot_calls" ON phonebot.calls;
CREATE POLICY "Service role full access to phonebot_calls"
  ON phonebot.calls FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 13. phonebot.leads
ALTER TABLE IF EXISTS phonebot.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to phonebot_leads" ON phonebot.leads;
CREATE POLICY "Service role full access to phonebot_leads"
  ON phonebot.leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify RLS is enabled on all tables:

-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname IN ('public', 'phonebot')
-- ORDER BY schemaname, tablename;

-- ============================================
-- NOTE ON SECURITY DEFINER VIEW
-- ============================================
-- The view public.subscription_with_usage uses SECURITY DEFINER.
-- This is often intentional for views that need to aggregate data
-- across rows that individual users shouldn't see directly.
-- Review if this view needs to be changed based on your security requirements.
