-- Create courier_orders table
CREATE TABLE IF NOT EXISTS courier_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) DEFAULT 'standard',
    special_instructions TEXT,
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    
    -- Electronic delivery receipt fields
    enable_electronic_delivery_receipt BOOLEAN DEFAULT false,
    notify_recipient BOOLEAN DEFAULT false,
    send_confirmation_to_admin BOOLEAN DEFAULT false,
    recipient_email VARCHAR(255),
    notification_sent_at TIMESTAMPTZ,
    
    -- Sender notification fields
    sender_email VARCHAR(255),
    notify_sender_on_create BOOLEAN DEFAULT false,
    notify_sender_on_confirm BOOLEAN DEFAULT false,
    sender_notification_sent_at TIMESTAMPTZ,
    sender_confirmation_sent_at TIMESTAMPTZ,
    
    -- Account details (stored as JSONB for flexibility)
    account_details JSONB,
    
    -- Contact details (stored as JSONB)
    contact_details JSONB,
    
    -- Cost breakdown (stored as JSONB)
    cost JSONB,
    
    -- Insurance
    insurance VARCHAR(100)
);

-- Create courier_order_items table
CREATE TABLE IF NOT EXISTS courier_order_items (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    dimensions VARCHAR(100),
    vol_kgs DECIMAL(10,2),
    mass_kgs DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification_records table
CREATE TABLE IF NOT EXISTS notification_records (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'recipient', 'sender_created', 'sender_confirmed', 'admin'
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed'
    sent_at TIMESTAMPTZ DEFAULT now(),
    retries INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courier_orders_customer_id ON courier_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_courier_orders_pickup_address ON courier_orders(pickup_address);
CREATE INDEX IF NOT EXISTS idx_courier_orders_delivery_address ON courier_orders(delivery_address);
CREATE INDEX IF NOT EXISTS idx_courier_orders_status ON courier_orders(status);
CREATE INDEX IF NOT EXISTS idx_courier_orders_created_at ON courier_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_courier_order_items_courier_order_id ON courier_order_items(courier_order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_courier_order_id ON tracking_events(courier_order_id);
CREATE INDEX IF NOT EXISTS idx_notification_records_courier_order_id ON notification_records(courier_order_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE courier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_records ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
CREATE POLICY "Enable read access for all users" ON courier_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON courier_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON courier_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON courier_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON courier_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON courier_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON courier_order_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON courier_order_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON tracking_events FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tracking_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tracking_events FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON tracking_events FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON notification_records FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON notification_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON notification_records FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON notification_records FOR DELETE USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courier_orders_updated_at BEFORE UPDATE ON courier_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
