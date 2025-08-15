-- Complete demo user creation script that ensures both auth.users and user_profiles are synced
DO $$
DECLARE
    demo_user_id uuid;
    demo_auth_exists boolean;
    demo_profile_exists boolean;
BEGIN
    -- Check if demo user exists in auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'demo@tswsmartlog.com'
    ) INTO demo_auth_exists;
    
    -- Check if demo user exists in user_profiles
    SELECT EXISTS(
        SELECT 1 FROM user_profiles WHERE email = 'demo@tswsmartlog.com'
    ) INTO demo_profile_exists;
    
    RAISE NOTICE 'Demo user in auth.users: %', demo_auth_exists;
    RAISE NOTICE 'Demo user in user_profiles: %', demo_profile_exists;
    
    -- Create or update auth user first
    IF demo_auth_exists THEN
        -- Update existing auth user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('Demo@2468', gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"username": "demo", "first_name": "Demo", "surname": "User"}'
        WHERE email = 'demo@tswsmartlog.com';
        
        SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tswsmartlog.com';
        RAISE NOTICE 'Updated existing auth user with ID: %', demo_user_id;
    ELSE
        -- Create new auth user
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
            role,
            aud
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'demo@tswsmartlog.com',
            crypt('Demo@2468', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"username": "demo", "first_name": "Demo", "surname": "User"}',
            false,
            'authenticated',
            'authenticated'
        );
        
        SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tswsmartlog.com';
        RAISE NOTICE 'Created new auth user with ID: %', demo_user_id;
    END IF;
    
    -- Create or update user profile
    INSERT INTO user_profiles (
        id,
        user_id,
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
        demo_user_id,
        demo_user_id,
        'Demo',
        'User',
        'Demo User',
        'demo@tswsmartlog.com',
        'admin',
        'Administration',
        'dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard,clientPortal',
        now(),
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        first_name = 'Demo',
        surname = 'User',
        full_name = 'Demo User',
        email = 'demo@tswsmartlog.com',
        role = 'admin',
        department = 'Administration',
        page_access = 'dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard,clientPortal',
        updated_at = now();
    
    -- Also handle the case where user_profiles uses id as primary key
    INSERT INTO user_profiles (
        id,
        user_id,
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
        demo_user_id,
        demo_user_id,
        'Demo',
        'User',
        'Demo User',
        'demo@tswsmartlog.com',
        'admin',
        'Administration',
        'dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard,clientPortal',
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        user_id = demo_user_id,
        first_name = 'Demo',
        surname = 'User',
        full_name = 'Demo User',
        email = 'demo@tswsmartlog.com',
        role = 'admin',
        department = 'Administration',
        page_access = 'dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard,clientPortal',
        updated_at = now();
        
    RAISE NOTICE 'Demo user setup complete!';
    RAISE NOTICE 'Login credentials: username=demo, password=Demo@2468';
    RAISE NOTICE 'User ID: %', demo_user_id;
    
END $$;

-- Verify the setup
SELECT 
    'auth.users' as table_name,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'demo@tswsmartlog.com'

UNION ALL

SELECT 
    'user_profiles' as table_name,
    email,
    (role = 'admin') as email_confirmed,
    created_at,
    updated_at
FROM user_profiles 
WHERE email = 'demo@tswsmartlog.com';
