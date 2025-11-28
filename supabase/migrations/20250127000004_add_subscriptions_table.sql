-- ============================================================================
-- SUBSCRIPTIONS TABLE - Stripe Billing Integration
-- ============================================================================

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create usage_tracking table for conversation limits
CREATE TABLE IF NOT EXISTS public.usage_tracking (
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

-- 3. Add subscription limits to widgets table
ALTER TABLE public.widgets
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

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

-- 7. Create function to get or create subscription for user
CREATE OR REPLACE FUNCTION get_or_create_subscription(user_uuid UUID)
RETURNS public.subscriptions AS $$
DECLARE
  sub public.subscriptions;
BEGIN
  -- Try to get existing subscription
  SELECT * INTO sub FROM public.subscriptions WHERE user_id = user_uuid LIMIT 1;

  -- If no subscription exists, create a free trial
  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (
      user_id,
      plan,
      status,
      trial_ends_at,
      current_period_start,
      current_period_end
    ) VALUES (
      user_uuid,
      'free',
      'trialing',
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW() + INTERVAL '14 days'
    ) RETURNING * INTO sub;
  END IF;

  RETURN sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to track usage
CREATE OR REPLACE FUNCTION increment_conversation_count(user_uuid UUID)
RETURNS void AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
  current_period_end TIMESTAMPTZ;
BEGIN
  -- Get current billing period from subscription
  SELECT
    COALESCE(s.current_period_start, DATE_TRUNC('month', NOW())),
    COALESCE(s.current_period_end, DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
  INTO current_period_start, current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
  LIMIT 1;

  -- If no period found, use current month
  IF current_period_start IS NULL THEN
    current_period_start := DATE_TRUNC('month', NOW());
    current_period_end := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  END IF;

  -- Upsert usage tracking
  INSERT INTO public.usage_tracking (
    user_id,
    period_start,
    period_end,
    conversation_count,
    updated_at
  ) VALUES (
    user_uuid,
    current_period_start,
    current_period_end,
    1,
    NOW()
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    conversation_count = usage_tracking.conversation_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create view for subscription with usage
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

-- 10. Updated at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Updated at trigger for usage_tracking
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Auto-create subscription for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- For each existing user without a subscription, create a free trial
  FOR user_record IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.subscriptions s ON s.user_id = u.id
    WHERE s.id IS NULL
  LOOP
    PERFORM get_or_create_subscription(user_record.id);
  END LOOP;
END $$;