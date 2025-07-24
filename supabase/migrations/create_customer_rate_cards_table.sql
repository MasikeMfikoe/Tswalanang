-- Create customer_rate_cards table
CREATE TABLE IF NOT EXISTS customer_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    rate DECIMAL NOT NULL,
    currency TEXT NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one rate card per customer
ALTER TABLE customer_rate_cards 
ADD CONSTRAINT unique_customer_rate_card 
UNIQUE (customer_id, origin, destination);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_rate_cards_customer_id ON customer_rate_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_rate_cards_origin ON customer_rate_cards(origin);
CREATE INDEX IF NOT EXISTS idx_customer_rate_cards_destination ON customer_rate_cards(destination);

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
