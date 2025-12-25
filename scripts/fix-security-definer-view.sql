-- Fix Security Definer View: public.subscription_with_usage
-- Run this in Supabase SQL Editor
--
-- This changes the view from SECURITY DEFINER to SECURITY INVOKER
-- so it respects the querying user's permissions and RLS policies

-- Option 1: For PostgreSQL 15+ (Supabase uses this)
-- Simply alter the view property:
ALTER VIEW public.subscription_with_usage SET (security_invoker = on);

-- ============================================
-- Option 2: If Option 1 doesn't work, use this instead
-- (Uncomment and run after getting your view definition)
-- ============================================

-- First, get your current view definition by running:
-- SELECT pg_get_viewdef('public.subscription_with_usage', true);

-- Then drop and recreate with SECURITY INVOKER:
-- DROP VIEW IF EXISTS public.subscription_with_usage;
-- CREATE VIEW public.subscription_with_usage
-- WITH (security_invoker = on)
-- AS
-- <paste your view definition here>;

-- ============================================
-- Verification
-- ============================================
-- After running, verify the security_invoker is enabled:
-- SELECT c.relname, c.reloptions
-- FROM pg_class c
-- JOIN pg_namespace n ON c.relnamespace = n.oid
-- WHERE n.nspname = 'public' AND c.relname = 'subscription_with_usage';
