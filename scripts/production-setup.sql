-- Production Database Setup Script
-- Run these commands in your production Supabase instance

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'client', 'guest')),
  department VARCHAR(100),
  page_access TEXT[] DEFAULT ARRAY['dashboard'],
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  vat_number VARCHAR(50),
  importers_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier VARCHAR(255),
  importer VARCHAR(255),
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) DEFAULT 'pending',
  cargo_status VARCHAR(100),
  commercial_value DECIMAL(12,2),
  freight_cost DECIMAL(12,2),
  insurance_cost DECIMAL(12,2),
  customs_duties DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  freight_type VARCHAR(100),
  commercial_value DECIMAL(12,2),
  customs_duties DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  handling_fees DECIMAL(12,2),
  documentation_fees DECIMAL(12,2),
  storage_fees DECIMAL(12,2),
  total_estimate DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES user_profiles(id),
  document_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active'
);

-- 7. Create courier_orders table
CREATE TABLE IF NOT EXISTS courier_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waybill_no VARCHAR(100) UNIQUE NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_phone VARCHAR(50),
  sender_address TEXT,
  receiver_name VARCHAR(255) NOT NULL,
  receiver_phone VARCHAR(50),
  receiver_address TEXT,
  pickup_location VARCHAR(255),
  delivery_location VARCHAR(255),
  service_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  tracking_status VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create customer_rate_cards table
CREATE TABLE IF NOT EXISTS customer_rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  freight_type VARCHAR(100),
  rate_per_kg DECIMAL(10,2),
  minimum_charge DECIMAL(10,2),
  fuel_surcharge_percentage DECIMAL(5,2),
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create freight_types table
CREATE TABLE IF NOT EXISTS freight_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  base_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Insert default freight types
INSERT INTO freight_types (name, description, base_rate) VALUES
('Air Freight', 'Air cargo transportation', 5.50),
('Sea Freight', 'Ocean cargo transportation', 2.25),
('Road Freight', 'Road transportation', 1.75),
('Rail Freight', 'Railway transportation', 1.50)
ON CONFLICT (name) DO NOTHING;

-- 11. Create initial admin user (update with your details)
INSERT INTO user_profiles (
  username, 
  name, 
  surname, 
  email, 
  role, 
  department, 
  page_access
) VALUES (
  'admin',
  'System',
  'Administrator',
  'admin@tswsmartlog.com',
  'admin',
  'IT',
  ARRAY['dashboard', 'orders', 'customers', 'documents', 'deliveries', 'courierOrders', 'shipmentTracker', 'clientPortal', 'userManagement', 'settings']
) ON CONFLICT (username) DO NOTHING;

-- 12. Set up Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_orders ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your security requirements)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_documents_order_id ON documents(order_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_courier_orders_status ON courier_orders(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courier_orders_updated_at BEFORE UPDATE ON courier_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;
