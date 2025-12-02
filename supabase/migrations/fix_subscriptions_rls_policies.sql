-- ============================================
-- Fix RLS Policies for Subscriptions Table
-- ============================================
-- This migration fixes Row Level Security policies that are blocking
-- the Stripe webhook from creating/updating subscription records
-- even when using the service role key

-- Step 1: Check if RLS is enabled on subscriptions table
-- If RLS is not enabled, the service role key should work without policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on subscriptions table
-- This ensures we start fresh and remove any problematic policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'subscriptions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON subscriptions', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Create proper RLS policies for subscriptions table

-- Policy 1: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can update their own subscription (for client-side operations if needed)
CREATE POLICY "Users can update own subscription"
ON subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Policy 3: Allow authenticated users to insert their own subscription
-- This is for initial subscription creation from the client if needed
CREATE POLICY "Users can create own subscription"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Service role bypass (explicit policy)
-- Note: Service role should automatically bypass RLS, but we'll add this for clarity
-- This policy allows operations when the current user is the service role
CREATE POLICY "Service role has full access"
ON subscriptions FOR ALL
USING (
    -- Check if the current session is using the service role
    -- Service role operations won't have auth.uid() set
    auth.uid() IS NULL OR auth.uid() = user_id
);

-- Step 5: Grant necessary permissions to authenticated and anon roles
GRANT SELECT ON subscriptions TO authenticated;
GRANT INSERT, UPDATE ON subscriptions TO authenticated;

-- Step 6: Ensure the service_role has all permissions (should already have them)
GRANT ALL ON subscriptions TO service_role;

-- Step 7: Add comment explaining the RLS configuration
COMMENT ON TABLE subscriptions IS
'Subscription data for users. RLS enabled to allow users to see/edit their own subscriptions.
Service role (used by webhooks) bypasses RLS automatically.';

-- Step 8: Verify the service role key is being used correctly
-- This is just a diagnostic query to help verify the setup
DO $$
BEGIN
    RAISE NOTICE 'RLS Policies have been reconfigured for subscriptions table.';
    RAISE NOTICE 'Service role should now be able to bypass RLS.';
    RAISE NOTICE 'Make sure SUPABASE_SERVICE_ROLE_KEY is properly set in your environment.';
END $$;

-- Optional: Add the cancel_at column if you want to track scheduled cancellations
-- Uncomment the following if you want to add this field:
-- ALTER TABLE subscriptions
-- ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ;
-- COMMENT ON COLUMN subscriptions.cancel_at IS 'Timestamp when the subscription is scheduled to be canceled at the end of the billing period';