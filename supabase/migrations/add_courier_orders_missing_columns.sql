-- This file was left out for brevity. Assume it is correct and does not need any modifications.
-- Placeholder content for supabase/migrations/add_courier_orders_missing_columns.sql
ALTER TABLE courier_orders
ADD COLUMN IF NOT EXISTS package_description TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL,
ADD COLUMN IF NOT EXISTS dimensions TEXT;
