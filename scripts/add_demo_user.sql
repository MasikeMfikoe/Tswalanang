-- Adding demo user with admin access and password "demo"

-- First, insert the demo user into auth.users table
-- Note: This uses a pre-hashed password for "demo" using bcrypt
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at,
  phone_confirmed_at,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'demo@tswsmartlog.com',
  '$2a$10$8K1p/a0dUrZBvHEHdBVKoOuVd28qqs/Tt.GyHn7zyVb/OvW9JkjYi', -- bcrypt hash for "demo"
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  NULL,
  NULL,
  '',
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the demo user
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tswsmartlog.com';
    
    -- Insert into user_profiles table with admin role and full access
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        surname,
        role,
        department,
        page_access,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        'demo@tswsmartlog.com',
        'Demo',
        'User',
        'admin',
        'Administration',
        ARRAY[
            'dashboard',
            'orders',
            'customers',
            'documents',
            'deliveries',
            'courierOrders',
            'containerTracking',
            'shipmentTracker',
            'estimates',
            'currencyConversion',
            'rateCard',
            'auditTrail',
            'userManagement',
            'ediStatusInputs',
            'clientPortal',
            'trackingWelcome',
            'customerSummary',
            'directCreateOrder',
            'createOrder',
            'newOrder',
            'orderDetails',
            'courierOrderDetails',
            'deliveryConfirmation',
            'podManagement',
            'documentProcessing',
            'apiKeys',
            'settings',
            'userGroups',
            'trackingUsers',
            'navigationTest',
            'testDashboard',
            'debugEstimates',
            'debugRouting'
        ],
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        surname = EXCLUDED.surname,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        page_access = EXCLUDED.page_access,
        updated_at = NOW();
        
    RAISE NOTICE 'Demo user created/updated with ID: %', demo_user_id;
END $$;

-- Verify the demo user was created
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created,
    p.full_name,
    p.role,
    p.department,
    array_length(p.page_access, 1) as access_count
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.id
WHERE u.email = 'demo@tswsmartlog.com';
