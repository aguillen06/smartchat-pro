-- Chat Analytics Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chat_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  language VARCHAR(5) DEFAULT 'en',
  sources_used INT DEFAULT 0,
  response_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_chat_analytics_tenant ON chat_analytics(tenant_id);
CREATE INDEX idx_chat_analytics_created ON chat_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert
CREATE POLICY "Service role can insert analytics"
  ON chat_analytics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read
CREATE POLICY "Service role can read analytics"
  ON chat_analytics FOR SELECT
  TO service_role
  USING (true);
