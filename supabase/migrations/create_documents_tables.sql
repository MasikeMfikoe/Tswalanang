-- Create uploaded_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_order_id ON uploaded_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_type ON uploaded_documents(type);

-- Add RLS policies
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to select
CREATE POLICY select_uploaded_documents ON uploaded_documents
  FOR SELECT USING (true);

-- Create policy to allow all authenticated users to insert
CREATE POLICY insert_uploaded_documents ON uploaded_documents
  FOR INSERT WITH CHECK (true);

-- Create policy to allow all authenticated users to update
CREATE POLICY update_uploaded_documents ON uploaded_documents
  FOR UPDATE USING (true);
