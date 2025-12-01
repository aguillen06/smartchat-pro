-- Migration: Add cancel_at column to subscriptions table
-- This column tracks when a subscription is scheduled to be canceled
-- (Different from canceled_at which tracks when it was actually canceled)

-- Add the cancel_at column if it doesn't exist
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.cancel_at IS 'Timestamp when the subscription is scheduled to be canceled at the end of the billing period';

-- Optional: If you want to track this field, uncomment the webhook code that sets it
-- The webhook has been modified to work without this column by default