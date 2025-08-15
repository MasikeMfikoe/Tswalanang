-- Fix demo user authentication by ensuring both auth.users and user_profiles records exist

-- First, check if demo user exists in auth.users
DO $$
DECLARE
    demo_auth_id uuid;
    demo_profile_exists boolean;
BEGIN
    -- Check if demo user exists in auth.users
    SELECT id INTO demo_auth_id FROM auth.users WHERE email = 'demo@tswsmartlog.com';
    
    IF demo_auth_id IS NULL THEN
        -- Create demo user in auth.users if it doesn't exist
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
            aud,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'demo@tswsmartlog.com',
            crypt('demo', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"username": "demo"}',
            false,
            'authenticated',
            'authenticated',
            '',
            '',
            '',
            ''
        );
        
        -- Get the newly created user ID
        SELECT id INTO demo_auth_id FROM auth.users WHERE email = 'demo@tswsmartlog.com';
        
        RAISE NOTICE 'Created demo user in auth.users with ID: %', demo_auth_id;
    ELSE
        -- Update existing demo user password
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('demo', gen_salt('bf')),
            updated_at = now()
        WHERE email = 'demo@tswsmartlog.com';
        
        RAISE NOTICE 'Updated demo user password in auth.users';
    END IF;
    
    -- Check if demo user profile exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE email = 'demo@tswsmartlog.com') INTO demo_profile_exists;
    
    IF NOT demo_profile_exists THEN
        -- Create demo user profile if it doesn't exist
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
            demo_auth_id,
            demo_auth_id,
            'Demo',
            'User',
            'Demo User',
            'demo@tswsmartlog.com',
            'admin',
            'Administration',
            'dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard',
            now(),
            now()
        );
        
        RAISE NOTICE 'Created demo user profile';
    ELSE
        -- Update existing demo user profile to ensure correct user_id link
        UPDATE user_profiles 
        SET 
            user_id = demo_auth_id,
            role = 'admin',
            updated_at = now()
        WHERE email = 'demo@tswsmartlog.com';
        
        RAISE NOTICE 'Updated demo user profile with correct user_id link';
    END IF;
    
    RAISE NOTICE 'Demo user setup complete. Username: demo, Password: demo, Email: demo@tswsmartlog.com';
END $$;
