CREATE TABLE public.audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.user_profiles(id), -- Assuming user_profiles is your user table
    user_email TEXT,
    action TEXT NOT NULL,
    module TEXT,
    record_id TEXT,
    details JSONB,
    ip_address TEXT
);

ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.audit_trail
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Optional: Policy to allow inserts for authenticated users (e.g., for logging actions)
CREATE POLICY "Allow authenticated users to insert audit logs" ON public.audit_trail
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
