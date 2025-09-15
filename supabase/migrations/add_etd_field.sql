-- Add ETD field to orders table (ETA already exists)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS etd TIMESTAMPTZ;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS orders_etd_idx ON orders(etd);
CREATE INDEX IF NOT EXISTS orders_eta_idx ON orders(eta);
