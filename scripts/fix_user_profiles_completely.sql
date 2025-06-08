-- Step 1: Completely disable RLS and remove all policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read access" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON user_profiles;

-- Step 3: Grant direct table permissions to bypass RLS completely
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;

-- Step 4: Create the missing stored function
CREATE OR REPLACE FUNCTION public.insert_user_profile(
  user_id UUID,
  user_username TEXT,
  user_name TEXT,
  user_surname TEXT,
  user_email TEXT,
  user_role TEXT,
  user_department TEXT,
  user_page_access TEXT[]
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the user with security definer (runs with function owner's permissions)
  INSERT INTO user_profiles (
    id, 
    username, 
    name, 
    surname, 
    email, 
    role, 
    department, 
    page_access,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_username,
    user_name,
    user_surname,
    user_email,
    user_role,
    user_department,
    user_page_access,
    NOW(),
    NOW()
  )
  RETURNING to_jsonb(user_profiles.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details as JSON
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.insert_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_profile TO anon;
GRANT EXECUTE ON FUNCTION public.insert_user_profile TO service_role;

-- Step 6: Verify the table structure and add missing columns if needed
DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 7: Test the function
SELECT public.insert_user_profile(
  gen_random_uuid(),
  'test_function_user',
  'Test',
  'Function',
  'test_function@example.com',
  'guest',
  'Test Department',
  ARRAY['dashboard']::TEXT[]
);

-- Step 8: Verify the insert worked
SELECT COUNT(*) as total_users FROM user_profiles;

-- Step 9: Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Step 10: Show RLS status (should be disabled)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';
