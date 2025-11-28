-- ============================================================================
-- SIMPLIFIED SUBSCRIPTIONS TABLE - Stripe Billing Integration
-- ============================================================================

-- 1. Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_subscription CASCADE;
DROP FUNCTION IF EXISTS public.increment_conversation_count CASCADE;
DROP VIEW IF EXISTS subscription_with_usage CASCADE;

-- 2. Create subscriptions table with basic fields only
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Create usage_tracking table for conversation limits
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  conversation_count INTEGER DEFAULT 0,
  widget_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- 4. Create indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

-- 5. Create RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Create RLS policies for usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON public.usage_tracking FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. Create view for subscription with usage
CREATE OR REPLACE VIEW subscription_with_usage AS
SELECT
  s.*,
  COALESCE(u.conversation_count, 0) as current_conversation_count,
  COALESCE(u.widget_count, 0) as current_widget_count,
  CASE
    WHEN s.plan = 'free' THEN 100
    WHEN s.plan = 'starter' THEN 1000
    WHEN s.plan = 'pro' THEN 5000
    ELSE 100
  END as conversation_limit,
  CASE
    WHEN s.plan = 'free' THEN 1
    WHEN s.plan = 'starter' THEN 1
    WHEN s.plan = 'pro' THEN 3
    ELSE 1
  END as widget_limit
FROM public.subscriptions s
LEFT JOIN public.usage_tracking u
  ON u.user_id = s.user_id
  AND u.period_start = s.current_period_start;

-- Grant permissions
GRANT SELECT ON subscription_with_usage TO authenticated;

-- 8. Create or update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Updated at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Updated at trigger for usage_tracking
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Simple function to increment conversation count
CREATE OR REPLACE FUNCTION increment_conversation_count(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Upsert usage tracking
  INSERT INTO public.usage_tracking (
    user_id,
    period_start,
    period_end,
    conversation_count
  ) VALUES (
    user_uuid,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    1
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    conversation_count = usage_tracking.conversation_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;