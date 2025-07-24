-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    order_id TEXT, -- Can be linked to an order
    customer_id TEXT, -- Can be linked to a customer
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS documents_order_id_idx ON documents(order_id);
CREATE INDEX IF NOT EXISTS documents_customer_id_idx ON documents(customer_id);

-- Enable Row Level Security (RLS) for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view documents related to their orders
CREATE POLICY "Allow authenticated read access to documents" ON documents
FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to insert documents
CREATE POLICY "Allow authenticated insert access to documents" ON documents
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to update documents (e.g., change type)
CREATE POLICY "Allow authenticated update access to documents" ON documents
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated delete access to documents" ON documents
FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policy: Allow service_role to bypass RLS for documents (for admin operations)
CREATE POLICY "Allow service_role to bypass RLS on documents" ON documents
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);
