-- Create EDI Submission Status table
CREATE TABLE IF NOT EXISTS edi_submission_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    edi_submission_status TEXT DEFAULT 'pending',
    edi_status TEXT DEFAULT 'not_started', 
    file_status TEXT DEFAULT 'not_uploaded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create EDI Notes table  
CREATE TABLE IF NOT EXISTS edi_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    note_text TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_edi_submission_status_order_id ON edi_submission_status(order_id);
CREATE INDEX IF NOT EXISTS idx_edi_notes_order_id ON edi_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_edi_notes_created_at ON edi_notes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE edi_submission_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE edi_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on edi_submission_status" ON edi_submission_status FOR ALL USING (true);
CREATE POLICY "Allow all operations on edi_notes" ON edi_notes FOR ALL USING (true);

-- Insert some test data to verify tables work
INSERT INTO edi_submission_status (order_id, edi_submission_status, edi_status, file_status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'pending', 'not_started', 'not_uploaded')
ON CONFLICT DO NOTHING;
