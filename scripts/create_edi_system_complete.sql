-- Complete EDI system database setup
-- This script creates all necessary tables for the EDI functionality

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS edi_notes CASCADE;
DROP TABLE IF EXISTS edi_submission_status CASCADE;
DROP TABLE IF EXISTS edi_submission_status_options CASCADE;

-- Create EDI submission status options table
CREATE TABLE edi_submission_status_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('edi_submission_type', 'edi_status_type', 'file_status_type')),
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, value)
);

-- Create EDI submission status table (main data)
CREATE TABLE edi_submission_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    edi_submission_status TEXT,
    edi_status TEXT,
    file_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Create EDI notes table
CREATE TABLE edi_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default options for EDI Status
INSERT INTO edi_submission_status_options (category, value, label, display_order) VALUES
('edi_status_type', 'query', 'Query', 1),
('edi_status_type', 'pre_stopped', 'Pre-Stopped', 2),
('edi_status_type', 'stopped', 'Stopped', 3),
('edi_status_type', 'released', 'Released', 4);

-- Insert default options for EDI Submission Status
INSERT INTO edi_submission_status_options (category, value, label, display_order) VALUES
('edi_submission_type', 'draft_entry', 'Draft Entry', 1),
('edi_submission_type', 'edi_submitted', 'EDI Submitted', 2);

-- Insert default options for File Status
INSERT INTO edi_submission_status_options (category, value, label, display_order) VALUES
('file_status_type', 'framed', 'Framed', 1),
('file_status_type', 'ready_for_pick_up', 'Ready for Pick Up', 2),
('file_status_type', 'pending_pick_up', 'Pending Pick Up', 3);

-- Create indexes for better performance
CREATE INDEX idx_edi_options_category ON edi_submission_status_options(category);
CREATE INDEX idx_edi_options_active ON edi_submission_status_options(is_active);
CREATE INDEX idx_edi_status_order ON edi_submission_status(order_id);
CREATE INDEX idx_edi_notes_order ON edi_notes(order_id);
