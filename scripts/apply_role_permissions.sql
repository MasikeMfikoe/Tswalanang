-- Apply role-based permissions to all users except Demo user
-- This script updates the page_access column based on user roles

-- Update Admin users
UPDATE user_profiles 
SET page_access = ARRAY[
  'dashboard:view,create,edit,delete',
  'orders:view,create,edit,delete',
  'customers:view,create,edit,delete',
  'documents:view,create,edit,delete',
  'deliveries:view,create,edit,delete',
  'courierOrders:view,create,edit,delete',
  'containerTracking:view,create,edit,delete',
  'clientPortal:view,create,edit,delete',
  'currencyConversion:view,create,edit,delete',
  'rateCard:view,create,edit,delete',
  'auditTrail:view,create,edit,delete',
  'admin:view,create,edit,delete',
  'shipmentTracker:view,create,edit,delete',
  'ediStatusInputs:view,create,edit,delete'
],
updated_at = NOW()
WHERE role = 'admin' AND email != 'demo@tswsmartlog.com';

-- Update Manager users (with client portal and user management access)
UPDATE user_profiles 
SET page_access = ARRAY[
  'dashboard:view',
  'orders:view,create,edit',
  'customers:view,create,edit',
  'documents:view,create,edit',
  'deliveries:view,create,edit',
  'courierOrders:view,create,edit',
  'containerTracking:view',
  'clientPortal:view,create,edit',
  'currencyConversion:view',
  'rateCard:view',
  'auditTrail:view',
  'admin:view,create,edit',
  'shipmentTracker:view',
  'ediStatusInputs:view,create,edit'
],
updated_at = NOW()
WHERE role = 'manager' AND email != 'demo@tswsmartlog.com';

-- Update Employee users
UPDATE user_profiles 
SET page_access = ARRAY[
  'dashboard:view',
  'orders:view,create',
  'customers:view',
  'documents:view,create',
  'deliveries:view',
  'courierOrders:view,create',
  'containerTracking:view',
  'currencyConversion:view',
  'rateCard:view',
  'shipmentTracker:view'
],
updated_at = NOW()
WHERE role = 'employee' AND email != 'demo@tswsmartlog.com';

-- Update Client users
UPDATE user_profiles 
SET page_access = ARRAY[
  'containerTracking:view',
  'clientPortal:view',
  'shipmentTracker:view'
],
updated_at = NOW()
WHERE role = 'client' AND email != 'demo@tswsmartlog.com';

-- Update Guest users
UPDATE user_profiles 
SET page_access = ARRAY[
  'containerTracking:view',
  'shipmentTracker:view'
],
updated_at = NOW()
WHERE role = 'guest' AND email != 'demo@tswsmartlog.com';

-- Update Tracking users
UPDATE user_profiles 
SET page_access = ARRAY[
  'containerTracking:view',
  'shipmentTracker:view'
],
updated_at = NOW()
WHERE role = 'tracking' AND email != 'demo@tswsmartlog.com';

-- Verify the updates
SELECT 
  email,
  role,
  array_length(page_access, 1) as permission_count,
  page_access
FROM user_profiles 
WHERE email != 'demo@tswsmartlog.com'
ORDER BY role, email;
