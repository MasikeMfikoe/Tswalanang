-- Update user_profiles table to support client users
-- Add client role to the role enum if it doesn't exist
DO $$ 
BEGIN
    -- Check if 'client' role exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'client' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'user_role'
        )
    ) THEN
        -- Add 'client' to the user_role enum
        ALTER TYPE user_role ADD VALUE 'client';
    END IF;
END $$;

-- Add associated_orders column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS associated_orders TEXT[] DEFAULT '{}';

-- Add is_client_user column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_client_user BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_page_access ON user_profiles USING GIN(page_access);

-- Create a function to automatically restrict client user access
CREATE OR REPLACE FUNCTION enforce_client_user_restrictions()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is a client, ensure they only have shipment tracker access
    IF NEW.role = 'client' THEN
        NEW.page_access := ARRAY['shipmentTracker'];
        NEW.is_client_user := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce client restrictions
DROP TRIGGER IF EXISTS trigger_enforce_client_restrictions ON user_profiles;
CREATE TRIGGER trigger_enforce_client_restrictions
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION enforce_client_user_restrictions();

-- Create a view for client orders (orders associated with client email)
CREATE OR REPLACE VIEW client_orders AS
SELECT 
    o.*,
    up.id as client_user_id,
    up.name as client_name,
    up.surname as client_surname
FROM orders o
JOIN user_profiles up ON up.email = o.customer_email
WHERE up.role = 'client';

-- Grant appropriate permissions
GRANT SELECT ON client_orders TO authenticated;

-- Create RLS policy for client users to only see their own orders
CREATE POLICY "Client users can only view their own orders" ON orders
    FOR SELECT
    TO authenticated
    USING (
        CASE 
            WHEN auth.jwt() ->> 'role' = 'client' THEN
                customer_email = auth.jwt() ->> 'email'
            ELSE true
        END
    );

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Insert some sample client users for testing
INSERT INTO user_profiles (
    id,
    name,
    surname,
    username,
    email,
    department,
    role,
    page_access,
    is_client_user,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'John',
    'Client',
    'john.client',
    'john.client@example.com',
    'External',
    'client',
    ARRAY['shipmentTracker'],
    TRUE,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Jane',
    'Customer',
    'jane.customer',
    'jane.customer@example.com',
    'External',
    'client',
    ARRAY['shipmentTracker'],
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create a function to get client user orders
CREATE OR REPLACE FUNCTION get_client_user_orders(client_email TEXT)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    customer_name TEXT,
    destination TEXT,
    tracking_number TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number,
        o.status,
        o.created_at,
        o.customer_name,
        o.destination,
        o.tracking_number
    FROM orders o
    WHERE o.customer_email = client_email
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_client_user_orders(TEXT) TO authenticated;

COMMENT ON TABLE user_profiles IS 'User profiles table supporting both internal and client users';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin, manager, employee, guest, tracking, or client';
COMMENT ON COLUMN user_profiles.associated_orders IS 'Array of order IDs associated with this user (mainly for client users)';
COMMENT ON COLUMN user_profiles.is_client_user IS 'Boolean indicating if the user is a client user';
COMMENT ON VIEW client_orders IS 'View showing orders associated with client users based on email matching';
COMMENT ON FUNCTION get_client_user_orders(TEXT) IS 'Function to get orders for a specific client user by email';
