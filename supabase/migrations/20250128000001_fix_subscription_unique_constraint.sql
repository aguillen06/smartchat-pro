-- ============================================================================
-- FIX SUBSCRIPTION UNIQUE CONSTRAINTS
-- ============================================================================
-- The issue: stripe_customer_id should NOT be unique because a customer can have multiple subscriptions
-- Instead, stripe_subscription_id and user_id should be unique

-- 1. Drop the incorrect unique constraint on stripe_customer_id
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_stripe_customer_id_key;

-- 2. Ensure stripe_subscription_id is unique (if not already)
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_stripe_subscription_id_key
UNIQUE (stripe_subscription_id);

-- 3. The user_id constraint is already correct (UNIQUE(user_id) from original migration)
-- This ensures one subscription per user in our database