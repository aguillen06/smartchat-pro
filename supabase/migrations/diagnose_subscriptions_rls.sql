-- ============================================
-- Diagnostic Script for Subscriptions Table RLS
-- ============================================
-- Run this FIRST to understand the current state before applying fixes

-- 1. Check if RLS is enabled on the subscriptions table
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'subscriptions';

-- 2. List all existing RLS policies on subscriptions table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'subscriptions';

-- 3. Check current user and role
SELECT
    current_user,
    current_role,
    session_user;

-- 4. Check if auth schema exists and functions are available
SELECT EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'auth'
    AND routine_name = 'uid'
);

-- 5. Check table permissions for different roles
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'subscriptions'
ORDER BY grantee, privilege_type;

-- 6. Check if service_role exists
SELECT rolname
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'service_role');

-- 7. Test if current session can insert (will fail if policies block it)
-- DO NOT run this in production, just for testing
-- INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status)
-- VALUES ('test-user-id', 'test-customer', 'test-subscription', 'free', 'active')
-- RETURNING id;