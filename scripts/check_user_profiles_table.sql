-- This script checks for the existence of the user_profiles table and its columns.
-- It's useful for debugging and ensuring the schema is as expected.

DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if user_profiles table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE 'Table user_profiles exists.';

        -- Check for id column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'id'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column id exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column id DOES NOT exist in user_profiles.';
        END IF;

        -- Check for email column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'email'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column email exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column email DOES NOT exist in user_profiles.';
        END IF;

        -- Check for full_name column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'full_name'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column full_name exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column full_name DOES NOT exist in user_profiles.';
        END IF;

        -- Check for role column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'role'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column role exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column role DOES NOT exist in user_profiles.';
        END IF;

        -- Check for customer_id column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'customer_id'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column customer_id exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column customer_id DOES NOT exist in user_profiles.';
        END IF;

        -- Check for created_at column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'created_at'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column created_at exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column created_at DOES NOT exist in user_profiles.';
        END IF;

        -- Check for updated_at column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'updated_at'
        ) INTO column_exists;
        IF column_exists THEN
            RAISE NOTICE 'Column updated_at exists in user_profiles.';
        ELSE
            RAISE WARNING 'Column updated_at DOES NOT exist in user_profiles.';
        END IF;

        -- Display all columns with their data types and nullability
        RAISE NOTICE 'Listing all columns in user_profiles table:';
        FOR column_record IN
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Column: %, Data Type: %, Nullable: %, Default: %', column_record.column_name, column_record.data_type, column_record.is_nullable, column_record.column_default;
        END LOOP;

        -- Check RLS policies on user_profiles
        RAISE NOTICE 'RLS policies on user_profiles table:';
        FOR policy_record IN
            SELECT policyname, permissive, roles, cmd, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'user_profiles'
        LOOP
            RAISE NOTICE 'Policy Name: %, Permissive: %, Roles: %, Command: %, Qual: %, With Check: %', policy_record.policyname, policy_record.permissive, policy_record.roles, policy_record.cmd, policy_record.qual, policy_record.with_check;
        END LOOP;

        -- Check triggers
        RAISE NOTICE 'Triggers on user_profiles table:';
        FOR trigger_record IN
            SELECT tgname, relname
            FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            WHERE c.relname = 'user_profiles'
        LOOP
            RAISE NOTICE 'Trigger Name: %, Table Name: %', trigger_record.tgname, trigger_record.relname;
        END LOOP;

        -- Check for any existing data
        PERFORM RAISE NOTICE 'Number of rows in user_profiles table: %', (SELECT COUNT(*) FROM user_profiles);

        -- Check for any duplicate emails (if email column exists)
        IF column_exists THEN
            FOR duplicate_email IN
                SELECT email, COUNT(*)
                FROM user_profiles
                GROUP BY email
                HAVING COUNT(*) > 1
            LOOP
                RAISE NOTICE 'Duplicate email found: %, Count: %', duplicate_email.email, duplicate_email.count;
            END LOOP;
        END IF;

        -- Check for any duplicate usernames (if username column exists)
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'username'
        ) INTO column_exists;
        IF column_exists THEN
            FOR duplicate_username IN
                SELECT username, COUNT(*)
                FROM user_profiles
                GROUP BY username
                HAVING COUNT(*) > 1
            LOOP
                RAISE NOTICE 'Duplicate username found: %, Count: %', duplicate_username.username, duplicate_username.count;
            END LOOP;
        END IF;

        -- Check for any users without a role (if role column exists)
        IF column_exists THEN
            PERFORM RAISE NOTICE 'Number of users without a role: %', (SELECT COUNT(*) FROM user_profiles WHERE role IS NULL);
        END IF;

        -- Check for any users not linked to auth.users (if id is a foreign key)
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'id'
            AND udt_name = 'auth.users_id'
        ) INTO column_exists;
        IF column_exists THEN
            FOR unlinked_user IN
                SELECT up.id
                FROM user_profiles up
                LEFT JOIN auth.users au ON up.id = au.id
                WHERE au.id IS NULL
            LOOP
                RAISE NOTICE 'Unlinked user found: %', unlinked_user.id;
            END LOOP;
        END IF;

    ELSE
        RAISE NOTICE 'user_profiles table does not exist.';
    END IF;

    RAISE NOTICE 'SUCCESS: user_profiles table structure and RLS policies checked';
END
$$;
