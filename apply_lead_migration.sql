-- Run this SQL in your Supabase SQL Editor
-- to update the leads table for lead capture functionality

-- Make name and email nullable (some leads might only provide email or phone)
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Add source field to track how the lead was captured
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat_prompt';

-- Add comments for documentation
COMMENT ON COLUMN leads.created_at IS 'Timestamp when the lead was captured';
COMMENT ON COLUMN leads.source IS 'How the lead was captured: chat_prompt, manual, etc.';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
