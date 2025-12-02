-- ============================================
-- Alternative Solution: Disable RLS on Subscriptions Table
-- ============================================
-- If the RLS policies are causing issues even with service role key,
-- the simplest solution might be to disable RLS on the subscriptions table
-- since it's primarily managed by the webhook (server-side only)

-- IMPORTANT: Only run this if the fix_subscriptions_rls_policies.sql doesn't work

-- Option 1: Completely disable RLS on subscriptions table
-- This is the simplest solution if subscriptions are only managed server-side
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions
GRANT SELECT ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;

-- Add comment explaining the configuration
COMMENT ON TABLE subscriptions IS
'Subscription data managed by Stripe webhooks. RLS disabled as this table is only modified server-side.
Users can still read their own subscription data through API endpoints that filter by user_id.';

-- Diagnostic message
DO $$
BEGIN
    RAISE NOTICE 'RLS has been DISABLED on subscriptions table.';
    RAISE NOTICE 'This table will now be accessible based on role permissions only.';
    RAISE NOTICE 'Make sure to handle access control in your application layer.';
END $$;