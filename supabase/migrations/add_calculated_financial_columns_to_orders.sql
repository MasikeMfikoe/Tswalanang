-- Add calculated financial columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customs_vat DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_disbursements DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS facility_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS agency_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN orders.customs_vat IS 'Calculated as 15% of commercial value';
COMMENT ON COLUMN orders.total_disbursements IS 'Sum of all direct costs (duties, VAT, handling, shipping, documentation, communication)';
COMMENT ON COLUMN orders.facility_fee IS 'Calculated as percentage of total disbursements';
COMMENT ON COLUMN orders.agency_fee IS 'Calculated as percentage of total disbursements';
COMMENT ON COLUMN orders.subtotal_amount IS 'Total disbursements + facility fee + agency fee';
COMMENT ON COLUMN orders.vat_amount IS 'VAT on subtotal (15%)';
COMMENT ON COLUMN orders.total_amount IS 'Final total amount (subtotal + VAT)';
