-- Create EDI submission status table
CREATE TABLE IF NOT EXISTS public.edi_submission_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    edi_submission_status TEXT DEFAULT 'pending',
    edi_status TEXT DEFAULT 'not_submitted',
    file_status TEXT DEFAULT 'not_generated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create EDI notes table
CREATE TABLE IF NOT EXISTS public.edi_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_edi_submission_status_order_id ON public.edi_submission_status(order_id);
CREATE INDEX IF NOT EXISTS idx_edi_notes_order_id ON public.edi_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_edi_notes_created_at ON public.edi_notes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.edi_submission_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edi_notes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for your security requirements)
CREATE POLICY IF NOT EXISTS "Allow all operations on edi_submission_status" ON public.edi_submission_status
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on edi_notes" ON public.edi_notes
    FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.edi_submission_status TO authenticated;
GRANT ALL ON public.edi_notes TO authenticated;
GRANT ALL ON public.edi_submission_status TO anon;
GRANT ALL ON public.edi_notes TO anon;
