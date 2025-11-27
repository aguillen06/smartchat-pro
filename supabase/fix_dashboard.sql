-- =====================================================
-- FIX DASHBOARD - Run this in Supabase SQL Editor
-- =====================================================

-- 1. DISABLE RLS ON ALL TABLES (for testing)
ALTER TABLE widgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- 2. ADD AUTO-WIDGET TRIGGER
CREATE OR REPLACE FUNCTION create_widget_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  widget_key TEXT;
  customer_id_val UUID;
BEGIN
  -- Generate a unique widget key
  widget_key := 'widget_' || substring(md5(random()::text) from 1 for 16);

  -- Get or create a customer record for this user
  INSERT INTO customers (email, business_name, created_at)
  VALUES (NEW.email, 'Personal Account', NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO customer_id_val;

  -- Create a default widget for the new user
  INSERT INTO widgets (
    customer_id,
    owner_id,
    widget_key,
    welcome_message,
    ai_instructions,
    primary_color,
    is_active
  ) VALUES (
    customer_id_val,
    NEW.id,
    widget_key,
    'Hi! How can I help you today?',
    'You are a helpful AI assistant. Be friendly, concise, and helpful.',
    '#3B82F6',
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_widget_for_new_user();

-- 3. CREATE WIDGETS FOR EXISTING USERS
-- First, check which users need widgets
SELECT
  u.id,
  u.email,
  w.id as widget_id
FROM auth.users u
LEFT JOIN widgets w ON w.owner_id = u.id
WHERE w.id IS NULL;

-- For each user without a widget, run this (replace USER_ID and USER_EMAIL):
/*
DO $$
DECLARE
  widget_key TEXT;
  customer_id_val UUID;
  user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace with actual user ID
  user_email TEXT := 'YOUR_EMAIL_HERE'; -- Replace with actual email
BEGIN
  -- Generate widget key
  widget_key := 'widget_' || substring(md5(random()::text) from 1 for 16);

  -- Get or create customer
  INSERT INTO customers (email, business_name, created_at)
  VALUES (user_email, 'Personal Account', NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO customer_id_val;

  -- Create widget
  INSERT INTO widgets (
    customer_id,
    owner_id,
    widget_key,
    welcome_message,
    ai_instructions,
    primary_color,
    is_active
  ) VALUES (
    customer_id_val,
    user_id,
    widget_key,
    'Hi! How can I help you today?',
    'You are a helpful AI assistant. Be friendly, concise, and helpful.',
    '#3B82F6',
    true
  );
END $$;
*/

-- 4. VERIFY
SELECT
  u.email,
  w.id as widget_id,
  w.widget_key,
  w.welcome_message
FROM auth.users u
LEFT JOIN widgets w ON w.owner_id = u.id;
