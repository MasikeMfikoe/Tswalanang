-- Complete Database Setup Script for TSW Smartlog Logistics Management System
-- Run this script in your new Supabase project's SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'client', 'guest', 'tracking');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE courier_status AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- 1. Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address_street TEXT,
    address_city VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'South Africa',
    vat_number VARCHAR(50),
    importers_code VARCHAR(50),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'guest',
    department TEXT,
    page_access TEXT[] DEFAULT ARRAY['dashboard'],
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier VARCHAR(255),
    importer VARCHAR(255),
    customer_id UUID REFERENCES customers(id),
    status order_status DEFAULT 'pending',
    cargo_status VARCHAR(100),
    commercial_value DECIMAL(12,2),
    freight_cost DECIMAL(12,2),
    insurance_cost DECIMAL(12,2),
    customs_duties DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create estimates table
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 5. Create uploaded_documents table
CREATE TABLE uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES user_profiles(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create courier_orders table
CREATE TABLE courier_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waybill_no VARCHAR(100) UNIQUE NOT NULL,
    po_number VARCHAR(100),
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    status courier_status DEFAULT 'pending',
    service_type VARCHAR(50) DEFAULT 'standard',
    special_instructions TEXT,
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    enable_electronic_delivery_receipt BOOLEAN DEFAULT false,
    notify_recipient BOOLEAN DEFAULT false,
    send_confirmation_to_admin BOOLEAN DEFAULT false,
    recipient_email VARCHAR(255),
    sender_email VARCHAR(255),
    notify_sender_on_create BOOLEAN DEFAULT false,
    notify_sender_on_confirm BOOLEAN DEFAULT false,
    account_details JSONB,
    contact_details JSONB,
    cost JSONB,
    insurance VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create courier_order_items table
CREATE TABLE courier_order_items (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    dimensions VARCHAR(100),
    vol_kgs DECIMAL(10,2),
    mass_kgs DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create tracking_events table
CREATE TABLE tracking_events (
    id SERIAL PRIMARY KEY,
    courier_order_id UUID REFERENCES courier_orders(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create EDI submission status options table
CREATE TABLE edi_submission_status_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('edi_submission_type', 'edi_status_type', 'file_status_type')),
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, value)
);

-- 10. Create EDI submission status table
CREATE TABLE edi_submission_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    edi_submission_status TEXT,
    edi_status TEXT,
    file_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id)
);

-- 11. Create EDI notes table
CREATE TABLE edi_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create freight_types table
CREATE TABLE freight_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    base_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create customer_rate_cards table
CREATE TABLE customer_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    freight_type VARCHAR(100),
    rate_per_kg DECIMAL(10,2),
    minimum_charge DECIMAL(10,2),
    fuel_surcharge_percentage DECIMAL(5,2),
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default freight types
INSERT INTO freight_types (name, description, base_rate) VALUES
('Air Freight', 'Air cargo transportation', 5.50),
('Sea Freight', 'Ocean cargo transportation', 2.25),
('Road Freight', 'Road transportation', 1.75),
('Rail Freight', 'Railway transportation', 1.50)
ON CONFLICT (name) DO NOTHING;

-- Insert default EDI options
INSERT INTO edi_submission_status_options (category, value, label, display_order) VALUES
-- EDI Status options
('edi_status_type', 'query', 'Query', 1),
('edi_status_type', 'pre_stopped', 'Pre-Stopped', 2),
('edi_status_type', 'stopped', 'Stopped', 3),
('edi_status_type', 'released', 'Released', 4),
-- EDI Submission Status options
('edi_submission_type', 'draft_entry', 'Draft Entry', 1),
('edi_submission_type', 'edi_submitted', 'EDI Submitted', 2),
-- File Status options
('file_status_type', 'framed', 'Framed', 1),
('file_status_type', 'ready_for_pick_up', 'Ready for Pick Up', 2),
('file_status_type', 'pending_pick_up', 'Pending Pick Up', 3);

-- Create sample customers
INSERT INTO customers (name, contact_person, email, phone, address_street, address_city, address_postal_code, address_country, vat_number, importers_code, total_orders, total_spent) VALUES 
('ABC Trading Company', 'John Smith', 'john@abctrading.com', '+27-11-555-0123', '123 Business Ave', 'Johannesburg', '2000', 'South Africa', 'ZA123456789', 'IMP001', 15, 125000.00),
('Global Imports Ltd', 'Sarah Johnson', 'sarah@globalimports.com', '+27-21-555-0456', '456 Commerce St', 'Cape Town', '8000', 'South Africa', 'ZA987654321', 'IMP002', 8, 75000.00),
('Pacific Logistics Inc', 'Mike Chen', 'mike@pacificlogistics.com', '+27-31-555-0789', '789 Harbor Blvd', 'Durban', '4000', 'South Africa', 'ZA456789123', 'IMP003', 22, 200000.00)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_po_number ON orders(po_number);
CREATE INDEX idx_uploaded_documents_order_id ON uploaded_documents(order_id);
CREATE INDEX idx_courier_orders_waybill_no ON courier_orders(waybill_no);
CREATE INDEX idx_courier_orders_status ON courier_orders(status);
CREATE INDEX idx_courier_order_items_courier_order_id ON courier_order_items(courier_order_id);
CREATE INDEX idx_tracking_events_courier_order_id ON tracking_events(courier_order_id);
CREATE INDEX idx_edi_options_category ON edi_submission_status_options(category);
CREATE INDEX idx_edi_options_active ON edi_submission_status_options(is_active);
CREATE INDEX idx_edi_status_order ON edi_submission_status(order_id);
CREATE INDEX idx_edi_notes_order ON edi_notes(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uploaded_documents_updated_at BEFORE UPDATE ON uploaded_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courier_orders_updated_at BEFORE UPDATE ON courier_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE edi_submission_status_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE edi_submission_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE edi_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (adjust based on your security requirements)
-- Basic policy: authenticated users can access all data
CREATE POLICY "Enable access for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON user_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON estimates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON uploaded_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON courier_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON courier_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON tracking_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON edi_submission_status_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON edi_submission_status FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access for authenticated users" ON edi_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON freight_types FOR SELECT USING (true);
CREATE POLICY "Enable access for authenticated users" ON customer_rate_cards FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create demo admin user function (call this after setting up authentication)
CREATE OR REPLACE FUNCTION create_demo_admin_user()
RETURNS void AS $$
BEGIN
    -- This function should be called after creating the auth user
    -- Insert demo admin user profile
    INSERT INTO user_profiles (
        id,
        username, 
        full_name, 
        email, 
        role, 
        department, 
        page_access
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid, -- Replace with actual auth user ID
        'demo',
        'Demo Administrator',
        'demo@tswsmartlog.com',
        'admin',
        'IT',
        ARRAY['dashboard', 'orders', 'customers', 'documents', 'deliveries', 'courierOrders', 'shipmentTracker', 'clientPortal', 'userManagement', 'settings', 'ediStatusInputs']
    ) ON CONFLICT (username) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

COMMIT;
