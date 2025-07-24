-- Completely remove all RLS policies and disable RLS for user_profiles table

-- 1. Drop specific policies on user_profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- 2. Drop ALL remaining policies on user_profiles table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 3. Disable RLS completely
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Grant all permissions to bypass any access issues
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON user_profiles TO postgres;

-- 5. Grant schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 6. Verify no policies exist
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No RLS policies found'
        ELSE 'WARNING: ' || COUNT(*) || ' policies still exist'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 7. Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'SUCCESS: RLS disabled'
        ELSE 'WARNING: RLS still enabled'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 8. Test basic operations
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test_' || extract(epoch from now()) || '@example.com';
BEGIN
    -- Test insert
    INSERT INTO user_profiles (
        id, username, name, surname, email, role, department, page_access
    ) VALUES (
        test_id, 'test.user', 'Test', 'User', test_email, 'employee', 'Testing', ARRAY['dashboard']
    );
    
    -- Test select
    PERFORM * FROM user_profiles WHERE id = test_id;
    
    -- Test update
    UPDATE user_profiles SET name = 'Updated Test' WHERE id = test_id;
    
    -- Test delete
    DELETE FROM user_profiles WHERE id = test_id;
    
    RAISE NOTICE 'SUCCESS: All CRUD operations completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR during test operations: %', SQLERRM;
        -- Clean up in case of partial success
        DELETE FROM user_profiles WHERE id = test_id;
END $$;

SELECT 'COMPLETE: user_profiles table is ready for use without RLS restrictions' as final_status;
