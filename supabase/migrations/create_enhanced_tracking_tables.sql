-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to recreate with new structure (if running this as a fresh migration)
-- DROP TABLE IF EXISTS tracking_events CASCADE;
-- DROP TABLE IF EXISTS shipments CASCADE;
-- DROP TABLE IF EXISTS enhanced_tracking_data CASCADE;

-- Create shipments table with enhanced structure
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  container_number VARCHAR(20) UNIQUE NOT NULL,
  bill_of_lading VARCHAR(50),
  booking_reference VARCHAR(50),
  container_owner VARCHAR(50), -- Detected from prefix (e.g., "Blue Star Maritime")
  container_prefix VARCHAR(4), -- First 4 characters (e.g., "BMOU")
  operating_carrier VARCHAR(100), -- Actual carrier operating the vessel

  -- Current status
  current_status VARCHAR(50) DEFAULT 'Unknown',
  current_location VARCHAR(255),

  -- Vessel information
  vessel_name VARCHAR(100),
  voyage_number VARCHAR(50),

  -- Route information
  port_of_loading VARCHAR(100),
  port_of_discharge VARCHAR(100),

  -- Timing
  eta TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Cargo details
  weight_kg DECIMAL(10,2),
  volume_cbm DECIMAL(10,2),
  container_type VARCHAR(20), -- 20GP, 40GP, 40HC, etc.
  number_of_packages INTEGER,
  commodity VARCHAR(255),

  -- Metadata
  data_source VARCHAR(50) DEFAULT 'api', -- 'api', 'manual', 'webhook'
  external_tracking_url TEXT,
  raw_api_response JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced_tracking_data table
CREATE TABLE IF NOT EXISTS enhanced_tracking_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number TEXT NOT NULL,
    provider TEXT NOT NULL,
    current_status TEXT,
    last_updated TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ,
    origin_port TEXT,
    destination_port TEXT,
    vessel_name TEXT,
    voyage_number TEXT,
    container_number TEXT,
    events JSONB, -- Store an array of tracking events
    raw_data JSONB, -- Store the full raw response from the provider
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracking_events table (for detailed event history)
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enhanced_tracking_id UUID NOT NULL REFERENCES enhanced_tracking_data(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    event_timestamp TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_container_number ON shipments(container_number);
CREATE INDEX IF NOT EXISTS idx_shipments_bill_of_lading ON shipments(bill_of_lading);
CREATE INDEX IF NOT EXISTS idx_shipments_container_prefix ON shipments(container_prefix);
CREATE UNIQUE INDEX IF NOT EXISTS enhanced_tracking_data_unique_tracking_provider_idx ON enhanced_tracking_data(tracking_number, provider);
CREATE INDEX IF NOT EXISTS enhanced_tracking_data_tracking_number_idx ON enhanced_tracking_data(tracking_number);
CREATE INDEX IF NOT EXISTS enhanced_tracking_data_provider_idx ON enhanced_tracking_data(provider);
CREATE INDEX IF NOT EXISTS tracking_events_enhanced_tracking_id_idx ON tracking_events(enhanced_tracking_id);
CREATE INDEX IF NOT EXISTS tracking_events_event_timestamp_idx ON tracking_events(event_timestamp DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shipments table
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for enhanced_tracking_data table
CREATE TRIGGER update_enhanced_tracking_data_updated_at
BEFORE UPDATE ON enhanced_tracking_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional, can be removed for production)
INSERT INTO shipments (
  container_number, container_owner, container_prefix, operating_carrier,
  current_status, current_location, vessel_name, voyage_number,
  port_of_loading, port_of_discharge, eta,
  weight_kg, volume_cbm, container_type, number_of_packages, commodity,
  external_tracking_url
) VALUES
(
  'BMOU2441814', 'Blue Star Maritime', 'BMOU', 'Maersk Line',
  'In Transit', 'Mediterranean Sea', 'MSC OSCAR', 'MS2401E',
  'Piraeus, Greece', 'Valencia, Spain', NOW() + INTERVAL '3 days',
  24500.00, 67.5, '40HC', 1250, 'Electronics',
  'https://www.maersk.com/tracking/BMOU2441814'
),
(
  'MAEU1234567', 'Maersk', 'MAEU', 'Maersk Line',
  'Port of Discharge', 'Los Angeles, USA', 'MAERSK ESSEX', 'AE2401W',
  'Shanghai, China', 'Los Angeles, USA', NOW() + INTERVAL '1 day',
  22000.00, 58.3, '40GP', 980, 'Textiles',
  'https://www.maersk.com/tracking/MAEU1234567'
),
(
  'MSCU9876543', 'MSC', 'MSCU', 'MSC',
  'Container Discharged', 'Hamburg, Germany', 'MSC GULSUN', 'MG2401N',
  'Antwerp, Belgium', 'Hamburg, Germany', NOW() - INTERVAL '2 hours',
  18750.00, 45.2, '20GP', 650, 'Machinery',
  'https://www.msc.com/track-a-shipment?trackingNumber=MSCU9876543'
);

-- Insert sample tracking events (optional, can be removed for production)
INSERT INTO tracking_events (
  enhanced_tracking_id, status, location, event_timestamp, description
) VALUES
-- Events for BMOU2441814
(
  (SELECT id FROM enhanced_tracking_data WHERE tracking_number = 'BMOU2441814'),
  'Booking Confirmed', 'Piraeus, Greece', NOW() - INTERVAL '10 days', 'Container booking confirmed and allocated'
),
(
  (SELECT id FROM enhanced_tracking_data WHERE tracking_number = 'BMOU2441814'),
  'Container Loaded', 'Piraeus Port, Greece', NOW() - INTERVAL '8 days', 'Container loaded onto vessel'
),
(
  (SELECT id FROM enhanced_tracking_data WHERE tracking_number = 'BMOU2441814'),
  'Vessel Departed', 'Piraeus Port, Greece', NOW() - INTERVAL '7 days', 'Vessel departed from port of loading'
),
(
  (SELECT id FROM enhanced_tracking_data WHERE tracking_number = 'BMOU2441814'),
  'In Transit', 'Mediterranean Sea', NOW() - INTERVAL '3 days', 'Container in transit on vessel'
);

-- Enable Row Level Security (with permissive policies for development)
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_tracking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on shipments" ON shipments FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for enhanced_tracking_data
CREATE POLICY "Allow authenticated read access to enhanced_tracking_data" ON enhanced_tracking_data
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert access to enhanced_tracking_data" ON enhanced_tracking_data
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update access to enhanced_tracking_data" ON enhanced_tracking_data
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete access to enhanced_tracking_data" ON enhanced_tracking_data
FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow service_role to bypass RLS on enhanced_tracking_data" ON enhanced_tracking_data
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- RLS Policies for tracking_events
CREATE POLICY "Allow authenticated read access to tracking_events" ON tracking_events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow service_role to bypass RLS on tracking_events" ON tracking_events
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);
