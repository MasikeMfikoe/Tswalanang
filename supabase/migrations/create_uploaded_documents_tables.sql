-- Create the uploaded_documents table
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    order_id UUID, -- Changed to UUID
    customer_id UUID, -- Changed to UUID
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Pending'
);

-- Add/Alter columns to ensure correct types
DO $$
BEGIN
    -- Add customer_id if it doesn't exist, or alter its type if it's TEXT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_documents' AND column_name = 'customer_id') THEN
        ALTER TABLE uploaded_documents ADD COLUMN customer_id UUID;
    ELSIF (SELECT data_type FROM information_schema.columns WHERE table_name = 'uploaded_documents' AND column_name = 'customer_id') = 'text' THEN
        -- If it exists as TEXT, attempt to alter to UUID. This assumes existing data is valid UUID strings.
        ALTER TABLE uploaded_documents ALTER COLUMN customer_id TYPE UUID USING customer_id::uuid;
    END IF;

    -- Add order_id if it doesn't exist, or alter its type if it's TEXT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_documents' AND column_name = 'order_id') THEN
        ALTER TABLE uploaded_documents ADD COLUMN order_id UUID;
    ELSIF (SELECT data_type FROM information_schema.columns WHERE table_name = 'uploaded_documents' AND column_name = 'order_id') = 'text' THEN
        -- If it exists as TEXT, attempt to alter to UUID. This assumes existing data is valid UUID strings.
        ALTER TABLE uploaded_documents ALTER COLUMN order_id TYPE UUID USING order_id::uuid;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_documents' AND column_name = 'status') THEN
        ALTER TABLE uploaded_documents ADD COLUMN status TEXT DEFAULT 'Pending';
    END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS uploaded_documents_order_id_idx ON uploaded_documents(order_id);
CREATE INDEX IF NOT EXISTS uploaded_documents_customer_id_idx ON uploaded_documents(customer_id);

-- Enable Row Level Security (RLS) for uploaded_documents table
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view documents related to their orders or customers
CREATE POLICY "Allow authenticated read access to uploaded_documents" ON uploaded_documents
FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        -- If the user is an admin, allow all
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        OR
        -- If the user is a client, allow documents linked to their customer_id
        -- Cast user_profiles.customer_id to UUID for comparison with uploaded_documents.customer_id (now UUID)
        (customer_id IS NOT NULL AND customer_id = (SELECT customer_id::uuid FROM public.user_profiles WHERE id = auth.uid()))
        OR
        -- If the document is linked to an order, and that order belongs to the user's customer
        -- All IDs are now UUID, so direct comparison is fine.
        (order_id IS NOT NULL AND order_id IN (SELECT id FROM public.orders WHERE customer_id = (SELECT customer_id::uuid FROM public.user_profiles WHERE id = auth.uid())))
    )
);

-- RLS Policy: Allow authenticated users to insert documents
CREATE POLICY "Allow authenticated insert access to uploaded_documents" ON uploaded_documents
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to update documents (e.g., change type, status)
CREATE POLICY "Allow authenticated update access to uploaded_documents" ON uploaded_documents
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated delete access to uploaded_documents" ON uploaded_documents
FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policy: Allow service_role to bypass RLS for documents (for admin operations)
CREATE POLICY "Allow service_role to bypass RLS on uploaded_documents" ON uploaded_documents
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);
