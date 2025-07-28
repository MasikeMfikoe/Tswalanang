-- Create customer_rate_cards table
CREATE TABLE IF NOT EXISTS customer_rate_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sea_freight_communication_fee DECIMAL(10,2) DEFAULT 350.00,
    sea_freight_documentation_fee DECIMAL(10,2) DEFAULT 350.00,
    sea_freight_agency_fee DECIMAL(5,2) DEFAULT 3.50,
    sea_freight_facility_fee DECIMAL(5,2) DEFAULT 2.50,
    air_freight_communication_fee DECIMAL(10,2) DEFAULT 150.00,
    air_freight_documentation_fee DECIMAL(10,2) DEFAULT 250.00,
    air_freight_agency_fee DECIMAL(5,2) DEFAULT 3.50,
    air_freight_facility_fee DECIMAL(5,2) DEFAULT 2.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one rate card per customer
ALTER TABLE customer_rate_cards 
ADD CONSTRAINT unique_customer_rate_card 
UNIQUE (customer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_rate_cards_customer_id ON customer_rate_cards(customer_id);

-- Enable RLS
ALTER TABLE customer_rate_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON customer_rate_cards
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON customer_rate_cards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON customer_rate_cards
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON customer_rate_cards
    FOR DELETE USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_rate_cards_updated_at 
    BEFORE UPDATE ON customer_rate_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
