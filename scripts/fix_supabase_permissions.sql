-- COMPLETELY disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on user_profiles
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Grant ALL permissions to authenticated and anon users
GRANT ALL PRIVILEGES ON TABLE user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON TABLE user_profiles TO anon;
GRANT ALL PRIVILEGES ON TABLE user_profiles TO service_role;

-- Ensure email column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to user_profiles table';
    ELSE
        RAISE NOTICE 'Email column already exists in user_profiles table';
    END IF;
END $$;

-- Make sure all users have an email (fill in missing emails)
UPDATE user_profiles 
SET email = username || '@example.com' 
WHERE email IS NULL OR email = '';

-- Check final table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check RLS status (should be disabled)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check policies (should be empty)
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Count users
SELECT COUNT(*) as total_users FROM user_profiles;
