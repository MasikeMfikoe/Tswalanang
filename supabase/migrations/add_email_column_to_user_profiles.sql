-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Add email column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Update the table structure to match what the app expects
ALTER TABLE user_profiles 
ALTER COLUMN username SET NOT NULL,
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN surname SET NOT NULL,
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on username
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_username_unique'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
        RAISE NOTICE 'Added unique constraint on username column';
    ELSE
        RAISE NOTICE 'Username unique constraint already exists';
    END IF;
END $$;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Test insert to verify structure
INSERT INTO user_profiles (
    id, 
    username, 
    name, 
    surname, 
    email, 
    role, 
    department, 
    page_access
) VALUES (
    gen_random_uuid(),
    'test.user',
    'Test',
    'User',
    'test.user@example.com',
    'employee',
    'Test Department',
    ARRAY['dashboard']
) ON CONFLICT (email) DO NOTHING;

-- Clean up test data
DELETE FROM user_profiles WHERE email = 'test.user@example.com';

SELECT 'SUCCESS: user_profiles table structure updated and verified' as result;
