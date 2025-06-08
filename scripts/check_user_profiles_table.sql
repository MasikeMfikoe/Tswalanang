-- Check if user_profiles table exists and its structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check current data in user_profiles table
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
LIMIT 20;

-- Check RLS (Row Level Security) status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check existing RLS policies (should be empty if RLS is disabled)
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Count total users in table
SELECT COUNT(*) as total_users FROM user_profiles;

-- Check if table exists at all
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
) as table_exists;
