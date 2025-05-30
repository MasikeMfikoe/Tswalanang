-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    freight_type VARCHAR(100) NOT NULL,
    commercial_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    customs_duties DECIMAL(15,2) NOT NULL DEFAULT 0,
    customs_vat DECIMAL(15,2) NOT NULL DEFAULT 0,
    handling_fees DECIMAL(15,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    documentation_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    communication_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_disbursements DECIMAL(15,2) NOT NULL DEFAULT 0,
    facility_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    agency_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    vat DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_email ON estimates(customer_email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estimates_updated_at 
    BEFORE UPDATE ON estimates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
INSERT INTO estimates (
    customer_id,
    customer_name,
    customer_email,
    status,
    freight_type,
    commercial_value,
    customs_duties,
    customs_vat,
    handling_fees,
    shipping_cost,
    documentation_fee,
    communication_fee,
    total_disbursements,
    facility_fee,
    agency_fee,
    subtotal,
    vat,
    total_amount,
    notes
) VALUES 
(
    'CUST001',
    'Acme Corporation',
    'procurement@acmecorp.com',
    'Draft',
    'Air Freight',
    100000.00,
    9250.00,
    15000.00,
    4625.00,
    18500.00,
    250.00,
    150.00,
    47775.00,
    1194.38,
    1672.13,
    50641.51,
    7596.23,
    58237.74,
    'Priority shipment for manufacturing equipment'
),
(
    'CUST002',
    'Global Tech Solutions',
    'logistics@globaltech.com',
    'Sent',
    'Sea Freight',
    75000.00,
    6800.00,
    11250.00,
    3400.00,
    12000.00,
    180.00,
    120.00,
    33750.00,
    843.75,
    1181.25,
    35775.00,
    5366.25,
    41141.25,
    'Standard sea freight shipment'
),
(
    'CUST003',
    'Manufacturing Plus',
    'orders@mfgplus.com',
    'Accepted',
    'Air Freight',
    150000.00,
    13500.00,
    22500.00,
    6750.00,
    28000.00,
    300.00,
    200.00,
    71250.00,
    1781.25,
    2493.75,
    75525.00,
    11328.75,
    86853.75,
    'Urgent delivery required for production line'
);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view all estimates
CREATE POLICY "Users can view all estimates" ON estimates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert estimates
CREATE POLICY "Users can insert estimates" ON estimates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update estimates
CREATE POLICY "Users can update estimates" ON estimates
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete estimates
CREATE POLICY "Users can delete estimates" ON estimates
    FOR DELETE USING (auth.role() = 'authenticated');
