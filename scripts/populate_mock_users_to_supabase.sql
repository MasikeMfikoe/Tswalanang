-- Script to populate Supabase with mock user data
-- This will create both auth users and user profiles

-- Note: This script needs to be run with service role permissions
-- You can run this via the Supabase dashboard SQL editor or via API

-- First, let's check if we have any existing users to avoid duplicates
DO $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
BEGIN
    -- Mock User 1: Demo Admin
    BEGIN
        -- Try to create auth user
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'mock-user-id'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'demo@tswsmartlog.com',
            crypt('demo', gen_salt('bf')), -- Password: demo
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Demo User", "role": "admin"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Create user profile
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
            'mock-user-id'::UUID,
            'demo',
            'Demo',
            'User',
            'demo@tswsmartlog.com',
            'admin',
            'IT',
            ARRAY['dashboard', 'orders', 'customers', 'documents', 'deliveries', 'courierOrders', 'shipmentTracker'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Demo User';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Demo User: %', SQLERRM;
    END;

    -- Mock User 2: Tracking User
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'mock-tracking-id'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'tracking@client.com',
            crypt('tracking', gen_salt('bf')), -- Password: tracking
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Tracking User", "role": "guest"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

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
            'mock-tracking-id'::UUID,
            'tracking',
            'Tracking',
            'User',
            'tracking@client.com',
            'guest',
            'Client',
            ARRAY['shipmentTracker'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Tracking User';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Tracking User: %', SQLERRM;
    END;

    -- Mock User 3: Manager
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'mock-manager-id'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'john.manager@tswsmartlog.com',
            crypt('manager', gen_salt('bf')), -- Password: manager
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "John Manager", "role": "manager"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

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
            'mock-manager-id'::UUID,
            'manager',
            'John',
            'Manager',
            'john.manager@tswsmartlog.com',
            'manager',
            'Operations',
            ARRAY['dashboard', 'orders', 'customers', 'deliveries'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Manager User';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Manager User: %', SQLERRM;
    END;

    -- Mock User 4: Employee
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'mock-employee-id'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'jane.employee@tswsmartlog.com',
            crypt('employee', gen_salt('bf')), -- Password: employee
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Jane Employee", "role": "employee"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

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
            'mock-employee-id'::UUID,
            'employee',
            'Jane',
            'Employee',
            'jane.employee@tswsmartlog.com',
            'employee',
            'Customer Service',
            ARRAY['dashboard', 'orders'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Employee User';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Employee User: %', SQLERRM;
    END;

    -- Mock User 5: Client User 1
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'client-user-1'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'alice.johnson@abccompany.com',
            crypt('client1', gen_salt('bf')), -- Password: client1
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Alice Johnson", "role": "client"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

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
            'client-user-1'::UUID,
            'client1',
            'Alice',
            'Johnson',
            'alice.johnson@abccompany.com',
            'client',
            'ABC Company',
            ARRAY['clientPortal', 'shipmentTracker'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Client User 1';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Client User 1: %', SQLERRM;
    END;

    -- Mock User 6: Client User 2
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'client-user-2'::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID,
            'bob.smith@xyzcorp.com',
            crypt('client2', gen_salt('bf')), -- Password: client2
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Bob Smith", "role": "client"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

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
            'client-user-2'::UUID,
            'client2',
            'Bob',
            'Smith',
            'bob.smith@xyzcorp.com',
            'client',
            'XYZ Corp',
            ARRAY['clientPortal', 'shipmentTracker'],
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Created/Updated Client User 2';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Client User 2: %', SQLERRM;
    END;

END $$;

-- Verify the data was inserted
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
    'auth.users' as table_name,
    COUNT(*) as record_count
FROM auth.users
WHERE email LIKE '%tswsmartlog.com' OR email LIKE '%client.com' OR email LIKE '%abccompany.com' OR email LIKE '%xyzcorp.com';

-- Show the created users
SELECT 
    up.id,
    up.username,
    up.name,
    up.surname,
    up.email,
    up.role,
    up.department,
    up.page_access,
    au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.role, up.name;

-- Placeholder content for scripts/populate_mock_users_to_supabase.sql
-- Example: INSERT INTO public.user_profiles (id, email, full_name, role) VALUES (gen_random_uuid(), 'mock@example.com', 'Mock User', 'user');
SELECT 'Populating mock users to Supabase';
