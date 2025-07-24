-- This file was left out for brevity. Assume it is correct and does not need any modifications.
-- Placeholder content for supabase/migrations/fix_estimates_rls.sql
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON estimates
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON estimates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON estimates
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON estimates
FOR DELETE USING (auth.role() = 'authenticated');
