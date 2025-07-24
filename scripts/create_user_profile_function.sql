-- Create a stored procedure to insert users with elevated permissions
CREATE OR REPLACE FUNCTION insert_user_profile(
  user_id UUID,
  user_username TEXT,
  user_name TEXT,
  user_surname TEXT,
  user_email TEXT,
  user_role TEXT,
  user_department TEXT,
  user_page_access TEXT[]
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the user with security definer (runs with function owner's permissions)
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
    user_id,
    user_username,
    user_name,
    user_surname,
    user_email,
    user_role,
    user_department,
    user_page_access
  )
  RETURNING to_jsonb(user_profiles.*) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION insert_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION insert_user_profile TO anon;
GRANT EXECUTE ON FUNCTION insert_user_profile TO service_role;

-- Test the function
SELECT insert_user_profile(
  gen_random_uuid(),
  'test_function_user',
  'Test',
  'Function',
  'test_function@example.com',
  'guest',
  'Test Department',
  ARRAY['dashboard']::TEXT[]
);

-- Check if the user was inserted
SELECT * FROM user_profiles WHERE username = 'test_function_user';

-- Create a trigger function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the handle_new_user function after a new user is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
