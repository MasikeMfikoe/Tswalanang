-- Add customer_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer_id ON user_profiles(customer_id);

-- Update existing client users with a default customer (optional)
-- This assumes you have at least one customer in the customers table
-- Replace this with specific mappings if needed
UPDATE user_profiles
SET customer_id = (SELECT id FROM customers ORDER BY created_at LIMIT 1)
WHERE role = 'client' AND customer_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.customer_id IS 'Reference to the customer this user belongs to';
