-- Debug leads table issues

-- 1. Check if leads table exists and view structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- 2. Check if any leads exist
SELECT * FROM leads;

-- 3. Check RLS policies on leads table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'leads';

-- 4. Show any RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'leads';

-- 5. Disable RLS on leads table (if it's blocking inserts)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 6. Also disable RLS on conversations table (for lead_captured flag update)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- 7. Verify the changes
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('leads', 'conversations');

-- 8. Check if source column exists
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'leads'
  AND column_name = 'source'
) AS source_column_exists;
