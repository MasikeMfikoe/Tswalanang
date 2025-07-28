-- Add financial columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS commercial_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS customs_duties DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS handling_fees DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS documentation_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS communication_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS financial_notes TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_commercial_value ON orders(commercial_value);
CREATE INDEX IF NOT EXISTS idx_orders_total_value ON orders(total_value);
