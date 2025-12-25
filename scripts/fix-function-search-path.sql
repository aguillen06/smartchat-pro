-- Fix Function Search Path Mutable warnings
-- Run this in Supabase SQL Editor
--
-- Setting search_path prevents schema hijacking attacks where malicious
-- objects in other schemas could be called instead of intended ones

-- ============================================
-- STEP 1: Find exact function signatures
-- ============================================
-- Run this first to see the exact function signatures:
/*
SELECT n.nspname AS schema, p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('update_updated_at_column', 'search_knowledge',
                    'increment_conversation_count', 'upsert_knowledge_chunk',
                    'update_updated_at')
  AND n.nspname IN ('public', 'phonebot');
*/

-- ============================================
-- STEP 2: Fix each function
-- ============================================

-- 1. public.update_updated_at_column (trigger function - no args)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. public.search_knowledge
-- Common signature for vector search - adjust parameters if different
DO $$
BEGIN
  -- Try common signature patterns
  BEGIN
    ALTER FUNCTION public.search_knowledge(vector, float, int, uuid, text[], text[]) SET search_path = public, extensions;
  EXCEPTION WHEN undefined_function THEN
    BEGIN
      ALTER FUNCTION public.search_knowledge(vector, float, int, uuid) SET search_path = public, extensions;
    EXCEPTION WHEN undefined_function THEN
      BEGIN
        ALTER FUNCTION public.search_knowledge(vector, float, int) SET search_path = public, extensions;
      EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'search_knowledge: Run the query above to find exact signature';
      END;
    END;
  END;
END $$;

-- 3. public.increment_conversation_count
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION public.increment_conversation_count(uuid) SET search_path = public;
  EXCEPTION WHEN undefined_function THEN
    BEGIN
      ALTER FUNCTION public.increment_conversation_count() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'increment_conversation_count: Run the query above to find exact signature';
    END;
  END;
END $$;

-- 4. public.upsert_knowledge_chunk
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION public.upsert_knowledge_chunk(uuid, text, text, text, vector) SET search_path = public, extensions;
  EXCEPTION WHEN undefined_function THEN
    BEGIN
      ALTER FUNCTION public.upsert_knowledge_chunk(uuid, text, text, text, vector, jsonb) SET search_path = public, extensions;
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'upsert_knowledge_chunk: Run the query above to find exact signature';
    END;
  END;
END $$;

-- 5. phonebot.update_updated_at (trigger function - no args)
ALTER FUNCTION phonebot.update_updated_at() SET search_path = phonebot, public;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that search_path is now set:
/*
SELECT n.nspname, p.proname, p.proconfig
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('update_updated_at_column', 'search_knowledge',
                    'increment_conversation_count', 'upsert_knowledge_chunk',
                    'update_updated_at')
  AND n.nspname IN ('public', 'phonebot');
*/

-- ============================================
-- OTHER WARNINGS (Not SQL fixes)
-- ============================================

-- EXTENSION IN PUBLIC (public.vector):
-- Low priority. The pgvector extension in public schema is common.
-- Moving requires recreating all vector columns/indexes - not recommended
-- unless you have strict compliance requirements.

-- LEAKED PASSWORD PROTECTION (Auth):
-- Enable in Supabase Dashboard:
-- Go to: Authentication > Settings > Security
-- Enable: "Leaked password protection"
