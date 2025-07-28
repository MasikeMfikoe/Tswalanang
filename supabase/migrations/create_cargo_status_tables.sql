-- Create cargo_status_history table
CREATE TABLE IF NOT EXISTS cargo_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  comments TEXT,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS cargo_status_history_order_id_idx ON cargo_status_history(order_id);
CREATE INDEX IF NOT EXISTS cargo_status_history_timestamp_idx ON cargo_status_history(timestamp);

-- Add cargo status fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cargo_status TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_line TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS vessel TEXT,
ADD COLUMN IF NOT EXISTS voyage TEXT,
ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ;

-- Create a function to log cargo status changes
CREATE OR REPLACE FUNCTION log_cargo_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.cargo_status IS DISTINCT FROM NEW.cargo_status THEN
    INSERT INTO cargo_status_history (
      order_id,
      status,
      location,
      timestamp,
      updated_by,
      updated_by_name
    ) VALUES (
      NEW.id,
      NEW.cargo_status,
      NEW.location,
      COALESCE(NEW.last_updated, NOW()),
      NULL, -- This would be set by the application
      'System' -- Default value
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically log cargo status changes
DROP TRIGGER IF EXISTS cargo_status_change_trigger ON orders;
CREATE TRIGGER cargo_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.cargo_status IS DISTINCT FROM NEW.cargo_status)
EXECUTE FUNCTION log_cargo_status_change();
