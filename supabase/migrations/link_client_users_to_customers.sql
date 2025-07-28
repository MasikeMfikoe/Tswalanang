-- Link client users to existing customers table
-- Add customer_id to user_profiles for client users

ALTER TABLE user_profiles 
ADD COLUMN customer_id UUID REFERENCES customers(id);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_customer_id ON user_profiles(customer_id);

-- Update existing client users to link them to customers
-- This is a sample - you'll need to match your actual client users to customers

-- Example: Link client1 user to a customer
UPDATE user_profiles 
SET customer_id = (SELECT id FROM customers WHERE name = 'ABC Company' LIMIT 1)
WHERE username = 'client1' AND role = 'client';

-- Example: Link client2 user to a customer  
UPDATE user_profiles 
SET customer_id = (SELECT id FROM customers WHERE name = 'XYZ Corp' LIMIT 1)
WHERE username = 'client2' AND role = 'client';

-- Add some sample customers if they don't exist
INSERT INTO customers (id, name, contact_person, email, phone, address, total_orders, total_spent)
VALUES 
  (gen_random_uuid(), 'ABC Company', 'Alice Johnson', 'alice.johnson@abccompany.com', '+27123456789', 
   '{"street": "123 Business St", "city": "Cape Town", "postalCode": "8001", "country": "South Africa"}', 
   3, 75000),
  (gen_random_uuid(), 'XYZ Corp', 'Bob Smith', 'bob.smith@xyzcorp.com', '+27987654321',
   '{"street": "456 Corporate Ave", "city": "Johannesburg", "postalCode": "2000", "country": "South Africa"}',
   2, 50000)
ON CONFLICT (email) DO NOTHING;
