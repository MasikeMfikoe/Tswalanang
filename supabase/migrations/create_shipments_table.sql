-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  tracking_number TEXT UNIQUE NOT NULL,
  carrier TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  eta TIMESTAMPTZ,
  shipping_line VARCHAR(20) NOT NULL,
  location VARCHAR(255),
  vessel VARCHAR(100),
  voyage VARCHAR(50),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  next_update_time TIMESTAMPTZ DEFAULT NOW(),
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'instruction-sent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipments_container_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_booking_reference ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_next_update_time ON shipments(next_update_time);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

-- Create shipment_updates table to track history
CREATE TABLE IF NOT EXISTS shipment_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id),
  tracking_number TEXT UNIQUE NOT NULL,
  carrier TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  eta TIMESTAMPTZ,
  shipping_line VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  location VARCHAR(255),
  timestamp TIMESTAMPTZ,
  vessel VARCHAR(100),
  voyage VARCHAR(50),
  details TEXT,
  source VARCHAR(20) NOT NULL, -- 'api', 'webhook', or 'manual'
  raw TEXT, -- JSON stringified raw data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipment_updates_shipment_id ON shipment_updates(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_updates_created_at ON shipment_updates(created_at);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to add shipment when order is created
CREATE OR REPLACE FUNCTION create_shipment_for_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create shipment for sea freight or air freight orders
  IF NEW.freight_type IN ('Sea Freight', 'Air Freight') THEN
    INSERT INTO shipments (
      order_id,
      tracking_number,
      carrier,
      shipping_line,
      status,
      next_update_time
    ) VALUES (
      NEW.id,
      'other', -- Default tracking number, to be updated later
      'other', -- Default carrier, to be updated later
      'other', -- Default shipping line, to be updated later
      'instruction-sent',
      NOW() + INTERVAL '1 day' -- Start checking after 1 day
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create shipment when order is created
CREATE TRIGGER create_shipment_for_new_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION create_shipment_for_order();
