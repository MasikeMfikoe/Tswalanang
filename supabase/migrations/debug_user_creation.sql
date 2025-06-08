-- Debug script to check user creation issues

-- 1. Check if user_profiles table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check RLS policies on user_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. Try to insert a test user (this will show any constraint issues)
-- Note: This is just for testing - remove after debugging
/*
INSERT INTO user_profiles (
  id,
  username,
  name,
  surname,
  email,
  role,
  department,
  page_access
) VALUES (
  gen_random_uuid(),
  'test.client',
  'Test',
  'Client',
  'test.client@example.com',
  'client',
  'Test Company',
  ARRAY['clientPortal', 'shipmentTracker']
);
*/

-- 5. Check current users in the table
SELECT 
  id,
  username,
  name,
  surname,
  email,
  role,
  department,
  page_access,
  created_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
