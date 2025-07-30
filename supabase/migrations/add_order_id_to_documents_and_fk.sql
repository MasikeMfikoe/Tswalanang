-- First, check if the order_id column exists in the documents table
-- If it doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN order_id UUID;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_order_id_fkey' 
        AND table_name = 'documents'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT documents_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create an index on order_id for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_order_id ON documents(order_id);

-- Update any existing documents that might need to be linked to orders
-- This is optional and depends on your data structure
-- You may need to customize this based on your specific requirements
UPDATE documents 
SET order_id = (
    SELECT id FROM orders 
    WHERE orders.reference_number = documents.reference_number 
    LIMIT 1
)
WHERE order_id IS NULL 
AND reference_number IS NOT NULL
AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.reference_number = documents.reference_number
);
