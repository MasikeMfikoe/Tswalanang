-- Add missing columns to courier_orders table
ALTER TABLE courier_orders ADD COLUMN IF NOT EXISTS order_date DATE;
ALTER TABLE courier_orders ADD COLUMN IF NOT EXISTS senders_name VARCHAR(255);
ALTER TABLE courier_orders ADD COLUMN IF NOT EXISTS senders_date DATE;
ALTER TABLE courier_orders ADD COLUMN IF NOT EXISTS receivers_name VARCHAR(255);
ALTER TABLE courier_orders ADD COLUMN IF NOT EXISTS receivers_date DATE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courier_orders_order_date ON courier_orders(order_date);
