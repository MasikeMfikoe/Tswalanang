-- Script to ensure demo user exists in both auth.users and user_profiles tables
-- Run this in Supabase SQL Editor with service role permissions

DO $$
BEGIN
    -- First, try to create the demo user in auth.users
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
            gen_random_uuid(),
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
        ) ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Demo auth user created/exists';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error with auth user: %', SQLERRM;
    END;

    -- Get the auth user ID
    DECLARE
        auth_user_id UUID;
    BEGIN
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = 'demo@tswsmartlog.com';
        
        IF auth_user_id IS NULL THEN
            RAISE EXCEPTION 'Could not find demo user in auth.users';
        END IF;

        -- Create/update user profile
        INSERT INTO user_profiles (
            id,
            user_id,
            username,
            first_name,
            surname,
            full_name,
            email,
            role,
            department,
            page_access,
            created_at,
            updated_at
        ) VALUES (
            auth_user_id,
            auth_user_id,
            'demo',
            'Demo',
            'User',
            'Demo User',
            'demo@tswsmartlog.com',
            'admin',
            'IT',
            '["dashboard","orders","customers","documents","deliveries","courierOrders","shipmentTracker","userManagement","auditTrail","estimates","currency","rateCard"]',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            surname = EXCLUDED.surname,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            page_access = EXCLUDED.page_access,
            updated_at = NOW();

        RAISE NOTICE 'Demo user profile created/updated with ID: %', auth_user_id;
    END;
END $$;

-- Verify the demo user exists
SELECT 
    up.id,
    up.username,
    up.first_name,
    up.surname,
    up.email,
    up.role,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.username = 'demo';
