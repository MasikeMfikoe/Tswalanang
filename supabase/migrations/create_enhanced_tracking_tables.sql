-- Drop existing tables if they exist to recreate with new structure
DROP TABLE IF EXISTS tracking_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;

-- Create shipments table with enhanced structure
CREATE TABLE shipments (
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

-- Create tracking events table
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  container_number VARCHAR(20) NOT NULL,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'booking', 'loaded', 'departed', 'arrived', 'discharged', 'delivered'
  event_status VARCHAR(100) NOT NULL,
  event_description TEXT,
  
  -- Location and timing
  location VARCHAR(255),
  event_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Additional details
  vessel_name VARCHAR(100),
  voyage_number VARCHAR(50),
  terminal VARCHAR(100),
  
  -- Metadata
  data_source VARCHAR(50) DEFAULT 'api',
  raw_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_shipments_container_number ON shipments(container_number);
CREATE INDEX idx_shipments_bill_of_lading ON shipments(bill_of_lading);
CREATE INDEX idx_shipments_container_prefix ON shipments(container_prefix);
CREATE INDEX idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_container_number ON tracking_events(container_number);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(event_timestamp);

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

-- Insert sample data for testing
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

-- Insert sample tracking events
INSERT INTO tracking_events (
  shipment_id, container_number, event_type, event_status, event_description,
  location, event_timestamp, vessel_name, voyage_number
) VALUES 
-- Events for BMOU2441814
(
  (SELECT id FROM shipments WHERE container_number = 'BMOU2441814'),
  'BMOU2441814', 'booking', 'Booking Confirmed', 'Container booking confirmed and allocated',
  'Piraeus, Greece', NOW() - INTERVAL '10 days', 'MSC OSCAR', 'MS2401E'
),
(
  (SELECT id FROM shipments WHERE container_number = 'BMOU2441814'),
  'BMOU2441814', 'loaded', 'Container Loaded', 'Container loaded onto vessel',
  'Piraeus Port, Greece', NOW() - INTERVAL '8 days', 'MSC OSCAR', 'MS2401E'
),
(
  (SELECT id FROM shipments WHERE container_number = 'BMOU2441814'),
  'BMOU2441814', 'departed', 'Vessel Departed', 'Vessel departed from port of loading',
  'Piraeus Port, Greece', NOW() - INTERVAL '7 days', 'MSC OSCAR', 'MS2401E'
),
(
  (SELECT id FROM shipments WHERE container_number = 'BMOU2441814'),
  'BMOU2441814', 'in_transit', 'In Transit', 'Container in transit on vessel',
  'Mediterranean Sea', NOW() - INTERVAL '3 days', 'MSC OSCAR', 'MS2401E'
);

-- Enable Row Level Security (with permissive policies for development)
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on shipments" ON shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tracking_events" ON tracking_events FOR ALL USING (true) WITH CHECK (true);
