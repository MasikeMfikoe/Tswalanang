-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_customers_updated_at_column();

-- Add some sample customers for testing
INSERT INTO customers (
    name,
    email,
    phone,
    address
) VALUES 
(
    'ABC Trading Company',
    'john@abctrading.com',
    '+1-555-0123',
    '123 Business Ave, New York, 10001, USA'
),
(
    'Global Imports Ltd',
    'sarah@globalimports.com',
    '+1-555-0456',
    '456 Commerce St, Los Angeles, 90210, USA'
),
(
    'Pacific Logistics Inc',
    'mike@pacificlogistics.com',
    '+1-555-0789',
    '789 Harbor Blvd, San Francisco, 94102, USA'
),
(
    'European Freight Solutions',
    'emma@eurofreight.com',
    '+44-20-7946-0958',
    '10 Downing Street, London, SW1A 2AA, United Kingdom'
),
(
    'Asian Trade Partners',
    'hiroshi@asiantrade.com',
    '+81-3-1234-5678',
    '1-1-1 Shibuya, Tokyo, 150-0002, Japan'
)
ON CONFLICT (email) DO NOTHING;

-- Add RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view all customers
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert customers
CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update customers
CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete customers
CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (auth.role() = 'authenticated');
