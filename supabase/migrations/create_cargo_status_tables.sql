-- Create the cargo_status_types table
CREATE TABLE IF NOT EXISTS cargo_status_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial cargo status types if they don't exist
INSERT INTO cargo_status_types (status_name, description) VALUES
('Booked', 'Shipment has been booked and confirmed.'),
('In Transit', 'Shipment is currently in transit.'),
('At Port', 'Shipment has arrived at a port.'),
('Customs Cleared', 'Shipment has cleared customs.'),
('Delivered', 'Shipment has been successfully delivered.'),
('Delayed', 'Shipment is experiencing delays.'),
('Exception', 'An unexpected event has occurred with the shipment.'),
('Cancelled', 'Shipment has been cancelled.')
ON CONFLICT (status_name) DO NOTHING;

-- Create the cargo_status_history table
CREATE TABLE IF NOT EXISTS cargo_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL, -- Link to the order
    status_type_id UUID NOT NULL REFERENCES cargo_status_types(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS cargo_status_history_order_id_idx ON cargo_status_history(order_id);
CREATE INDEX IF NOT EXISTS cargo_status_history_status_type_id_idx ON cargo_status_history(status_type_id);

-- Enable Row Level Security (RLS) for cargo_status_types table
ALTER TABLE cargo_status_types ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to read cargo_status_types
CREATE POLICY "Allow authenticated read access to cargo_status_types" ON cargo_status_types
FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policy: Allow service_role to bypass RLS for cargo_status_types (for admin operations)
CREATE POLICY "Allow service_role to bypass RLS on cargo_status_types" ON cargo_status_types
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Enable Row Level Security (RLS) for cargo_status_history table
ALTER TABLE cargo_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view cargo status history related to their orders
CREATE POLICY "Allow authenticated read access to cargo_status_history" ON cargo_status_history
FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        -- If the user is an admin, allow all
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        OR
        -- If the user is a client, allow history linked to their customer_id
        (order_id IN (SELECT id FROM public.orders WHERE customer_id = (SELECT customer_id::uuid FROM public.user_profiles WHERE id = auth.uid())))
    )
);

-- RLS Policy: Allow authenticated users to insert cargo status history (e.g., for updates)
CREATE POLICY "Allow authenticated insert access to cargo_status_history" ON cargo_status_history
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to update cargo status history
CREATE POLICY "Allow authenticated update access to cargo_status_history" ON cargo_status_history
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to delete cargo status history
CREATE POLICY "Allow authenticated delete access to cargo_status_history" ON cargo_status_history
FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policy: Allow service_role to bypass RLS for cargo_status_history (for admin operations)
CREATE POLICY "Allow service_role to bypass RLS on cargo_status_history" ON cargo_status_history
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);
