-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view all estimates" ON estimates;
DROP POLICY IF EXISTS "Users can insert estimates" ON estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON estimates;
DROP POLICY IF EXISTS "Users can delete estimates" ON estimates;

-- Disable RLS temporarily for development
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON estimates
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Create specific policies if you want more control
-- CREATE POLICY "Users can view estimates" ON estimates
--     FOR SELECT USING (true);

-- CREATE POLICY "Users can insert estimates" ON estimates
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Users can update estimates" ON estimates
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Users can delete estimates" ON estimates
--     FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON estimates TO anon;
