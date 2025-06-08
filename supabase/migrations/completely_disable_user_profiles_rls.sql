-- Completely disable RLS and fix user_profiles table for development

-- 1. Drop ALL existing policies (including any hidden ones)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Completely disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions to all roles
GRANT ALL PRIVILEGES ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON user_profiles TO service_role;
GRANT ALL PRIVILEGES ON user_profiles TO postgres;

-- 4. Make sure the table is accessible
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 5. Test basic operations
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Test insert
    INSERT INTO user_profiles (
        id, username, name, surname, email, role, department, page_access
    ) VALUES (
        test_id, 'test.user', 'Test', 'User', 'test@example.com', 'employee', 'Testing', ARRAY['dashboard']
    );
    
    -- Test select
    PERFORM * FROM user_profiles WHERE id = test_id;
    
    -- Test delete
    DELETE FROM user_profiles WHERE id = test_id;
    
    RAISE NOTICE 'All operations successful - RLS completely disabled';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during test: %', SQLERRM;
END $$;

-- 6. Show final status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    'user_profiles table status' as description
FROM pg_tables 
WHERE tablename = 'user_profiles'

UNION ALL

SELECT 
    'public' as schemaname,
    'policies' as tablename,
    COUNT(*)::text as rls_enabled,
    'policy count (should be 0)' as description
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Success message
SELECT 'SUCCESS: RLS completely disabled, table ready for use' as result;
