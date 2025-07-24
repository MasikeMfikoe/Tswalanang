-- Populate rate cards for existing customers
-- This script adds default rate card values for all existing customers

-- First, check if the customer_rate_cards table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_rate_cards') THEN
        RAISE EXCEPTION 'customer_rate_cards table does not exist. Please run the migration first.';
    END IF;
END $$;

-- Insert default rate card data for existing customers who don't have rate cards yet
INSERT INTO customer_rate_cards (
    customer_id,
    sea_freight_communication_fee,
    sea_freight_documentation_fee,
    sea_freight_agency_fee,
    sea_freight_facility_fee,
    air_freight_communication_fee,
    air_freight_documentation_fee,
    air_freight_agency_fee,
    air_freight_facility_fee,
    created_at,
    updated_at
)
SELECT 
    c.id as customer_id,
    350 as sea_freight_communication_fee,      -- Default sea freight communication fee
    350 as sea_freight_documentation_fee,      -- Default sea freight documentation fee
    3.5 as sea_freight_agency_fee,             -- Default sea freight agency fee (%)
    2.5 as sea_freight_facility_fee,           -- Default sea freight facility fee (%)
    150 as air_freight_communication_fee,      -- Default air freight communication fee
    250 as air_freight_documentation_fee,      -- Default air freight documentation fee
    3.5 as air_freight_agency_fee,             -- Default air freight agency fee (%)
    2.5 as air_freight_facility_fee,           -- Default air freight facility fee (%)
    NOW() as created_at,
    NOW() as updated_at
FROM customers c
LEFT JOIN customer_rate_cards crc ON c.id = crc.customer_id
WHERE crc.customer_id IS NULL;  -- Only insert for customers who don't have rate cards yet

-- Show results
SELECT 
    COUNT(*) as customers_with_rate_cards_added,
    'Rate cards populated successfully' as status
FROM customer_rate_cards;

-- Verify the data
SELECT 
    c.name as customer_name,
    crc.sea_freight_communication_fee,
    crc.sea_freight_documentation_fee,
    crc.air_freight_communication_fee,
    crc.air_freight_documentation_fee,
    crc.created_at
FROM customers c
JOIN customer_rate_cards crc ON c.id = crc.customer_id
ORDER BY c.name;

-- Placeholder content for scripts/populate_existing_customers_rate_cards.sql
-- Example: INSERT INTO customer_rate_cards (customer_id, origin, destination, rate, currency, valid_from, valid_to) VALUES ('customer-id-1', 'NYC', 'LAX', 100.00, 'USD', '2023-01-01', '2023-12-31');
SELECT 'Populating existing customers rate cards';
