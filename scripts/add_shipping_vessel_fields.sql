-- Add shipping_line and vessel_name columns to orders table if they don't exist
DO $$ 
BEGIN
    -- Add shipping_line column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_line') THEN
        ALTER TABLE orders ADD COLUMN shipping_line VARCHAR(255);
    END IF;
    
    -- Add vessel_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'vessel_name') THEN
        ALTER TABLE orders ADD COLUMN vessel_name VARCHAR(255);
    END IF;
END $$;
