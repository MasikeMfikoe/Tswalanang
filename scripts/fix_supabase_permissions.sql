-- Ensure uuid-ossp extension is enabled for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant usage on schema public to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT, INSERT, UPDATE, DELETE on all tables in public schema to authenticated role
-- This is a broad grant and should be refined with RLS policies for production.
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.' || quote_ident(r.tablename) || ' TO authenticated;';
    END LOOP;
END
$$;

-- Grant USAGE on sequences (for auto-incrementing IDs)
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'GRANT USAGE ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO authenticated;';
    END LOOP;
END
$$;

-- Grant EXECUTE on all functions in public schema to authenticated role
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || quote_ident(r.proname) || ' TO authenticated;';
    END LOOP;
END
$$;

-- Alter default privileges for future tables/sequences to authenticated role
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE ON SEQUENCES TO authenticated;

-- Grant all privileges on all tables in the public schema to service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant all privileges on all sequences in the public schema to service_role
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant all privileges on all functions in the public schema to service_role
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Alter default privileges for future tables, sequences, and functions
-- to ensure service_role automatically gets permissions
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

RAISE NOTICE 'Permissions for service_role updated successfully.';

-- Set up RLS for user_profiles table
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to read their own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to update their own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy to allow service_role to bypass RLS (for admin operations)
DROP POLICY IF EXISTS "Allow service_role to bypass RLS" ON user_profiles;
CREATE POLICY "Allow service_role to bypass RLS" ON user_profiles
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for orders table
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read orders
DROP POLICY IF EXISTS "Allow authenticated read access to orders" ON orders;
CREATE POLICY "Allow authenticated read access to orders" ON orders
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert orders
DROP POLICY IF EXISTS "Allow authenticated insert access to orders" ON orders;
CREATE POLICY "Allow authenticated insert access to orders" ON orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update orders
DROP POLICY IF EXISTS "Allow authenticated update access to orders" ON orders;
CREATE POLICY "Allow authenticated update access to orders" ON orders
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete orders
DROP POLICY IF EXISTS "Allow authenticated delete access to orders" ON orders;
CREATE POLICY "Allow authenticated delete access to orders" ON orders
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for orders
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on orders" ON orders;
CREATE POLICY "Allow service_role to bypass RLS on orders" ON orders
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for customers table
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read customers
DROP POLICY IF EXISTS "Allow authenticated read access to customers" ON customers;
CREATE POLICY "Allow authenticated read access to customers" ON customers
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert customers
DROP POLICY IF EXISTS "Allow authenticated insert access to customers" ON customers;
CREATE POLICY "Allow authenticated insert access to customers" ON customers
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update customers
DROP POLICY IF EXISTS "Allow authenticated update access to customers" ON customers;
CREATE POLICY "Allow authenticated update access to customers" ON customers
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete customers
DROP POLICY IF EXISTS "Allow authenticated delete access to customers" ON customers;
CREATE POLICY "Allow authenticated delete access to customers" ON customers
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for customers
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on customers" ON customers;
CREATE POLICY "Allow service_role to bypass RLS on customers" ON customers
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for estimates table
ALTER TABLE IF EXISTS public.estimates ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read estimates
DROP POLICY IF EXISTS "Allow authenticated read access to estimates" ON estimates;
CREATE POLICY "Allow authenticated read access to estimates" ON estimates
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert estimates
DROP POLICY IF EXISTS "Allow authenticated insert access to estimates" ON estimates;
CREATE POLICY "Allow authenticated insert access to estimates" ON estimates
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update estimates
DROP POLICY IF EXISTS "Allow authenticated update access to estimates" ON estimates;
CREATE POLICY "Allow authenticated update access to estimates" ON estimates
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete estimates
DROP POLICY IF EXISTS "Allow authenticated delete access to estimates" ON estimates;
CREATE POLICY "Allow authenticated delete access to estimates" ON estimates
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for estimates
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on estimates" ON estimates;
CREATE POLICY "Allow service_role to bypass RLS on estimates" ON estimates
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for courier_orders table
ALTER TABLE IF EXISTS public.courier_orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read courier_orders
DROP POLICY IF EXISTS "Allow authenticated read access to courier_orders" ON courier_orders;
CREATE POLICY "Allow authenticated read access to courier_orders" ON courier_orders
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert courier_orders
DROP POLICY IF EXISTS "Allow authenticated insert access to courier_orders" ON courier_orders;
CREATE POLICY "Allow authenticated insert access to courier_orders" ON courier_orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update courier_orders
DROP POLICY IF EXISTS "Allow authenticated update access to courier_orders" ON courier_orders;
CREATE POLICY "Allow authenticated update access to courier_orders" ON courier_orders
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete courier_orders
DROP POLICY IF EXISTS "Allow authenticated delete access to courier_orders" ON courier_orders;
CREATE POLICY "Allow authenticated delete access to courier_orders" ON courier_orders
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for courier_orders
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on courier_orders" ON courier_orders;
CREATE POLICY "Allow service_role to bypass RLS on courier_orders" ON courier_orders
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for customer_rate_cards table
ALTER TABLE IF EXISTS public.customer_rate_cards ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read customer_rate_cards
DROP POLICY IF EXISTS "Allow authenticated read access to customer_rate_cards" ON customer_rate_cards;
CREATE POLICY "Allow authenticated read access to customer_rate_cards" ON customer_rate_cards
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert customer_rate_cards
DROP POLICY IF EXISTS "Allow authenticated insert access to customer_rate_cards" ON customer_rate_cards;
CREATE POLICY "Allow authenticated insert access to customer_rate_cards" ON customer_rate_cards
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update customer_rate_cards
DROP POLICY IF EXISTS "Allow authenticated update access to customer_rate_cards" ON customer_rate_cards;
CREATE POLICY "Allow authenticated update access to customer_rate_cards" ON customer_rate_cards
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete customer_rate_cards
DROP POLICY IF EXISTS "Allow authenticated delete access to customer_rate_cards" ON customer_rate_cards;
CREATE POLICY "Allow authenticated delete access to customer_rate_cards" ON customer_rate_cards
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for customer_rate_cards
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on customer_rate_cards" ON customer_rate_cards;
CREATE POLICY "Allow service_role to bypass RLS on customer_rate_cards" ON customer_rate_cards
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for freight_types table
ALTER TABLE IF EXISTS public.freight_types ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read freight_types
DROP POLICY IF EXISTS "Allow authenticated read access to freight_types" ON freight_types;
CREATE POLICY "Allow authenticated read access to freight_types" ON freight_types
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert freight_types
DROP POLICY IF EXISTS "Allow authenticated insert access to freight_types" ON freight_types;
CREATE POLICY "Allow authenticated insert access to freight_types" ON freight_types
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update freight_types
DROP POLICY IF EXISTS "Allow authenticated update access to freight_types" ON freight_types;
CREATE POLICY "Allow authenticated update access to freight_types" ON freight_types
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete freight_types
DROP POLICY IF EXISTS "Allow authenticated delete access to freight_types" ON freight_types;
CREATE POLICY "Allow authenticated delete access to freight_types" ON freight_types
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for freight_types
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on freight_types" ON freight_types;
CREATE POLICY "Allow service_role to bypass RLS on freight_types" ON freight_types
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for cargo_status_history table
ALTER TABLE IF EXISTS public.cargo_status_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read cargo_status_history
DROP POLICY IF EXISTS "Allow authenticated read access to cargo_status_history" ON cargo_status_history;
CREATE POLICY "Allow authenticated read access to cargo_status_history" ON cargo_status_history
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert cargo_status_history
DROP POLICY IF EXISTS "Allow authenticated insert access to cargo_status_history" ON cargo_status_history;
CREATE POLICY "Allow authenticated insert access to cargo_status_history" ON cargo_status_history
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update cargo_status_history
DROP POLICY IF EXISTS "Allow authenticated update access to cargo_status_history" ON cargo_status_history;
CREATE POLICY "Allow authenticated update access to cargo_status_history" ON cargo_status_history
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete cargo_status_history
DROP POLICY IF EXISTS "Allow authenticated delete access to cargo_status_history" ON cargo_status_history;
CREATE POLICY "Allow authenticated delete access to cargo_status_history" ON cargo_status_history
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for cargo_status_history
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on cargo_status_history" ON cargo_status_history;
CREATE POLICY "Allow service_role to bypass RLS on cargo_status_history" ON cargo_status_history
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for uploaded_documents table
ALTER TABLE IF EXISTS public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read uploaded_documents
DROP POLICY IF EXISTS "Allow authenticated read access to uploaded_documents" ON uploaded_documents;
CREATE POLICY "Allow authenticated read access to uploaded_documents" ON uploaded_documents
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert uploaded_documents
DROP POLICY IF EXISTS "Allow authenticated insert access to uploaded_documents" ON uploaded_documents;
CREATE POLICY "Allow authenticated insert access to uploaded_documents" ON uploaded_documents
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update uploaded_documents
DROP POLICY IF EXISTS "Allow authenticated update access to uploaded_documents" ON uploaded_documents;
CREATE POLICY "Allow authenticated update access to uploaded_documents" ON uploaded_documents
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete uploaded_documents
DROP POLICY IF EXISTS "Allow authenticated delete access to uploaded_documents" ON uploaded_documents;
CREATE POLICY "Allow authenticated delete access to uploaded_documents" ON uploaded_documents
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for uploaded_documents
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on uploaded_documents" ON uploaded_documents;
CREATE POLICY "Allow service_role to bypass RLS on uploaded_documents" ON uploaded_documents
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Set up RLS for enhanced_tracking_data table
ALTER TABLE IF EXISTS public.enhanced_tracking_data ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read enhanced_tracking_data
DROP POLICY IF EXISTS "Allow authenticated read access to enhanced_tracking_data" ON enhanced_tracking_data;
CREATE POLICY "Allow authenticated read access to enhanced_tracking_data" ON enhanced_tracking_data
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert enhanced_tracking_data
DROP POLICY IF EXISTS "Allow authenticated insert access to enhanced_tracking_data" ON enhanced_tracking_data;
CREATE POLICY "Allow authenticated insert access to enhanced_tracking_data" ON enhanced_tracking_data
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update enhanced_tracking_data
DROP POLICY IF EXISTS "Allow authenticated update access to enhanced_tracking_data" ON enhanced_tracking_data;
CREATE POLICY "Allow authenticated update access to enhanced_tracking_data" ON enhanced_tracking_data
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete enhanced_tracking_data
DROP POLICY IF EXISTS "Allow authenticated delete access to enhanced_tracking_data" ON enhanced_tracking_data;
CREATE POLICY "Allow authenticated delete access to enhanced_tracking_data" ON enhanced_tracking_data
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy to allow service_role to bypass RLS for enhanced_tracking_data
DROP POLICY IF EXISTS "Allow service_role to bypass RLS on enhanced_tracking_data" ON enhanced_tracking_data;
CREATE POLICY "Allow service_role to bypass RLS on enhanced_tracking_data" ON enhanced_tracking_data
FOR ALL USING (current_user = 'supabase_admin' OR current_user = 'service_role') WITH CHECK (true);

-- Grant usage on schema public to service_role
GRANT USAGE ON SCHEMA public TO service_role;

-- Specific grants for auth.users table (if needed for RLS or direct access)
GRANT SELECT ON TABLE auth.users TO authenticated;

RAISE NOTICE 'Permissions for authenticated role updated. Remember to define specific RLS policies for fine-grained access control.';

SELECT 'SUCCESS: Supabase permissions adjusted. Review RLS policies for fine-grained control.' as result;
