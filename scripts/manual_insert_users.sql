-- Manual script to insert users
INSERT INTO user_profiles (
  id,
  username,
  name,
  surname,
  email,
  role,
  department,
  page_access
) VALUES (
  gen_random_uuid(),
  'manual_test_user',
  'Manual',
  'Test',
  'manual_test@example.com',
  'employee',
  'Manual Department',
  ARRAY['dashboard', 'orders']
);

-- Insert a client user
INSERT INTO user_profiles (
  id,
  username,
  name,
  surname,
  email,
  role,
  department,
  page_access
) VALUES (
  gen_random_uuid(),
  'manual_client',
  'Manual',
  'Client',
  'manual_client@example.com',
  'client',
  'Client Company',
  ARRAY['clientPortal', 'shipmentTracker']
);

-- Check if users were inserted
SELECT * FROM user_profiles 
WHERE username IN ('manual_test_user', 'manual_client')
ORDER BY created_at DESC;

-- This file was left out for brevity. Assume it is correct and does not need any modifications.
-- Placeholder content for scripts/manual_insert_users.sql
-- Example: INSERT INTO auth.users (id, email, password) VALUES (gen_random_uuid(), 'test@example.com', 'password');
SELECT 'Manual user insert script executed';
