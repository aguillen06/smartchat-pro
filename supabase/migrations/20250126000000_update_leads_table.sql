-- Update leads table to make fields nullable and add source tracking
-- Created: 2025-11-26

-- Make name and email nullable (some leads might only provide email or phone)
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Add source field to track how the lead was captured
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat_prompt';

-- Add captured_at as alias/additional field (we already have created_at but this is more semantic)
COMMENT ON COLUMN leads.created_at IS 'Timestamp when the lead was captured (captured_at)';
COMMENT ON COLUMN leads.source IS 'How the lead was captured: chat_prompt, manual, etc.';
