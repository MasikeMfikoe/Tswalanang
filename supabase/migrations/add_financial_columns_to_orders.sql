-- This migration assumes the 'orders' table already exists.
-- If the 'orders' table does not exist, you would need a 'create_orders_table.sql' migration first.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS commercial_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS customs_duties DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS handling_fees DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS documentation_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS communication_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS financial_notes TEXT,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS profit DECIMAL(10,2);

-- Optional: Add a function or trigger to automatically calculate profit
-- This is an example and might need adjustment based on your exact schema and requirements.
CREATE OR REPLACE FUNCTION calculate_order_profit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profit := NEW.price - NEW.cost;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_profit_on_insert_update
BEFORE INSERT OR UPDATE OF cost, price ON orders
FOR EACH ROW
EXECUTE FUNCTION calculate_order_profit();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_commercial_value ON orders(commercial_value);
CREATE INDEX IF NOT EXISTS idx_orders_total_value ON orders(total_value);
