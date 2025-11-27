-- Link Demo Widget to Your User Account
--
-- Instructions:
-- 1. Sign up for an account at http://localhost:3000/signup
-- 2. Go to Supabase Dashboard → Authentication → Users
-- 3. Copy your user ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
-- 4. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 5. Run this SQL in Supabase SQL Editor

-- Link the demo widget to your account
UPDATE widgets
SET owner_id = 'YOUR_USER_ID_HERE'
WHERE widget_key = 'demo_widget_key_123';

-- Verify the update
SELECT
  id,
  widget_key,
  owner_id,
  is_active,
  created_at
FROM widgets
WHERE widget_key = 'demo_widget_key_123';

-- Expected result:
-- You should see your user ID in the owner_id column

-- Optional: Check your user info
SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE';
