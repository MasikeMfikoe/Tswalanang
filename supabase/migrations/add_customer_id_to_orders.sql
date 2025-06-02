-- Add customer_id column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Update existing orders to link them to customers based on customer_name or importer
-- This is a best-effort attempt to link existing data
UPDATE orders 
SET customer_id = customers.id
FROM customers 
WHERE orders.customer_id IS NULL 
AND (
  orders.customer_name = customers.name 
  OR orders.importer = customers.name
);

-- Add a comment to document the relationship
COMMENT ON COLUMN orders.customer_id IS 'Foreign key reference to customers table';
