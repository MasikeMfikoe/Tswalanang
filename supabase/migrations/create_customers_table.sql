-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address_street TEXT,
    address_city VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100),
    vat_number VARCHAR(50),
    importers_code VARCHAR(50),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    contact_person,
    email,
    phone,
    address_street,
    address_city,
    address_postal_code,
    address_country,
    vat_number,
    importers_code,
    total_orders,
    total_spent
) VALUES 
(
    'ABC Trading Company',
    'John Smith',
    'john@abctrading.com',
    '+1-555-0123',
    '123 Business Ave',
    'New York',
    '10001',
    'USA',
    'US123456789',
    'IMP001',
    15,
    125000.00
),
(
    'Global Imports Ltd',
    'Sarah Johnson',
    'sarah@globalimports.com',
    '+1-555-0456',
    '456 Commerce St',
    'Los Angeles',
    '90210',
    'USA',
    'US987654321',
    'IMP002',
    8,
    75000.00
),
(
    'Pacific Logistics Inc',
    'Mike Chen',
    'mike@pacificlogistics.com',
    '+1-555-0789',
    '789 Harbor Blvd',
    'San Francisco',
    '94102',
    'USA',
    'US456789123',
    'IMP003',
    22,
    200000.00
),
(
    'European Freight Solutions',
    'Emma Wilson',
    'emma@eurofreight.com',
    '+44-20-7946-0958',
    '10 Downing Street',
    'London',
    'SW1A 2AA',
    'United Kingdom',
    'GB123456789',
    'IMP004',
    12,
    95000.00
),
(
    'Asian Trade Partners',
    'Hiroshi Tanaka',
    'hiroshi@asiantrade.com',
    '+81-3-1234-5678',
    '1-1-1 Shibuya',
    'Tokyo',
    '150-0002',
    'Japan',
    'JP987654321',
    'IMP005',
    18,
    150000.00
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
