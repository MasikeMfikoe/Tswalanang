-- Create freight_types table
CREATE TABLE IF NOT EXISTS freight_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(20) UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_freight_types_updated_at 
    BEFORE UPDATE ON freight_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert common freight types
INSERT INTO freight_types (name, description, code) VALUES
    ('Full Container Load (FCL)', 'Full container dedicated to single shipper', 'FCL'),
    ('Less than Container Load (LCL)', 'Shared container space with multiple shippers', 'LCL'),
    ('Break Bulk', 'Cargo that is loaded individually rather than in containers', 'BB'),
    ('Roll-on/Roll-off (RoRo)', 'Vehicles and trailers driven on and off the vessel', 'RORO'),
    ('Refrigerated (Reefer)', 'Temperature-controlled container shipping', 'REEFER'),
    ('Dangerous Goods', 'Hazardous materials requiring special handling', 'DG'),
    ('Oversized/Heavy Lift', 'Cargo exceeding standard container dimensions', 'OOG'),
    ('Liquid Bulk', 'Liquid cargo transported in specialized tanks', 'BULK_LIQ'),
    ('Dry Bulk', 'Dry commodities like grain, coal, ore', 'BULK_DRY'),
    ('Air Freight', 'Cargo transported by aircraft', 'AIR'),
    ('Road Freight', 'Cargo transported by truck/road', 'ROAD'),
    ('Rail Freight', 'Cargo transported by railway', 'RAIL');

-- Create index for better performance
CREATE INDEX idx_freight_types_active ON freight_types(active);
CREATE INDEX idx_freight_types_code ON freight_types(code);

-- Enable RLS (Row Level Security)
ALTER TABLE freight_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all authenticated users
CREATE POLICY "Allow read access to freight_types" ON freight_types
    FOR SELECT TO authenticated
    USING (true);

-- Create policy to allow insert/update/delete for admin users only
CREATE POLICY "Allow admin access to freight_types" ON freight_types
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );
