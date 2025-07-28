-- Create courier_orders table
CREATE TABLE IF NOT EXISTS courier_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    waybill_no VARCHAR(100) UNIQUE NOT NULL,
    po_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    service_type VARCHAR(50) DEFAULT 'standard',
    special_instructions TEXT,
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    
    -- Electronic delivery receipt fields
    enable_electronic_delivery_receipt BOOLEAN DEFAULT false,
    notify_recipient BOOLEAN DEFAULT false,
    send_confirmation_to_admin BOOLEAN DEFAULT false,
    recipient_email VARCHAR(255),
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Sender notification fields
    sender_email VARCHAR(255),
    notify_sender_on_create BOOLEAN DEFAULT false,
    notify_sender_on_confirm BOOLEAN DEFAULT false,
    sender_notification_sent_at TIMESTAMP WITH TIME ZONE,
    sender_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_records table
CREATE TABLE IF NOT EXISTS notification_records (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'recipient', 'sender_created', 'sender_confirmed', 'admin'
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retries INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courier_orders_waybill_no ON courier_orders(waybill_no);
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
