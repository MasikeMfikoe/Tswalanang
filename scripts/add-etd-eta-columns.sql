-- Add ETD (Estimated Time of Departure) and ETA (Estimated Time of Arrival) columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS etd TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ;

-- Add comments to document the columns
COMMENT ON COLUMN orders.etd IS 'Estimated Time of Departure';
COMMENT ON COLUMN orders.eta IS 'Estimated Time of Arrival';

-- Create indexes for better query performance on date filtering
CREATE INDEX IF NOT EXISTS idx_orders_etd ON orders(etd);
CREATE INDEX IF NOT EXISTS idx_orders_eta ON orders(eta);
