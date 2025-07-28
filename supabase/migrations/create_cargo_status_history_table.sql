-- Create cargo status history table if it doesn't exist
CREATE TABLE IF NOT EXISTS cargo_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  comments TEXT,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE cargo_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON cargo_status_history
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON cargo_status_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON cargo_status_history
  FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cargo_status_history_order_id ON cargo_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_cargo_status_history_timestamp ON cargo_status_history(timestamp);
