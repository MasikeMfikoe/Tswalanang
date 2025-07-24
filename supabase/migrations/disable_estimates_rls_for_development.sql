-- Temporarily disable RLS for estimates table during development
-- Run this in your Supabase SQL editor if you want to use real database

-- Disable RLS completely for development
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON estimates TO anon;
GRANT USAGE ON SEQUENCE estimates_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE estimates_id_seq TO anon;
