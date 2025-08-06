-- Create sync_failures table to track failed sync operations
CREATE TABLE IF NOT EXISTS sync_failures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    sync_data JSONB NOT NULL,
    failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sync_failures_failed_at ON sync_failures(failed_at);
CREATE INDEX IF NOT EXISTS idx_sync_failures_resolved ON sync_failures(resolved);

-- Add RLS policies
ALTER TABLE sync_failures ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage sync failures
CREATE POLICY "Service role can manage sync failures" ON sync_failures
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to view sync failures
CREATE POLICY "Authenticated users can view sync failures" ON sync_failures
    FOR SELECT USING (auth.role() = 'authenticated');
