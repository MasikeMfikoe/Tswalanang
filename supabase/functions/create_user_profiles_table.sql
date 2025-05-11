-- Create a stored procedure to create the user_profiles table
CREATE OR REPLACE FUNCTION public.create_user_profiles_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) THEN
    RETURN true;
  END IF;

  -- Create the table
  CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY,
    username TEXT,
    name TEXT,
    surname TEXT,
    role TEXT DEFAULT 'guest',
    department TEXT,
    page_access TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Set up Row Level Security
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  -- Create policies
  -- 1. Allow users to view their own profile
  CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

  -- 2. Allow users to update their own profile
  CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

  -- 3. Allow users to insert their own profile
  CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

  -- 4. Allow authenticated users to view all profiles (for simplicity in this app)
  CREATE POLICY "Authenticated users can view all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

  -- Create function to handle updated_at
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create trigger for updated_at
  CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  RETURN true;
END;
$$;
