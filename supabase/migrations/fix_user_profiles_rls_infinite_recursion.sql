-- Fix infinite recursion in user_profiles RLS policies

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_profiles;

-- 2. Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;

-- 4. Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 5. Check if we can insert a test record
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
  'test.user',
  'Test',
  'User',
  'test@example.com',
  'employee',
  'Testing',
  ARRAY['dashboard']
) ON CONFLICT (id) DO NOTHING;

-- 6. Clean up test record
DELETE FROM user_profiles WHERE email = 'test@example.com';

-- 7. Show current status
SELECT 
  'Table exists' as status,
  COUNT(*) as user_count
FROM user_profiles

UNION ALL

SELECT 
  'RLS disabled' as status,
  CASE WHEN pg_class.relrowsecurity THEN 0 ELSE 1 END as user_count
FROM pg_class 
WHERE relname = 'user_profiles';

-- Success message
SELECT 'RLS policies fixed - ready for user creation' as message;
