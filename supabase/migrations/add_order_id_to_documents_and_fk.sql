-- Add the order_id column to the documents table if it doesn't exist
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS order_id UUID;

-- Create a foreign key constraint linking documents.order_id to orders.id
ALTER TABLE documents
ADD CONSTRAINT fk_order_id
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE; -- Or ON DELETE SET NULL, depending on your desired behavior

-- Optionally, create an index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_order_id ON documents (order_id);

-- Additional updates can be inserted here if needed
