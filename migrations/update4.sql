-- ============================================================
-- MIGRATION: Add location fields to Vendors and Customers
-- ============================================================

-- Add latitude and longitude to Vendors table
ALTER TABLE Vendors 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER location,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude,
ADD INDEX idx_vendor_location (latitude, longitude);

-- Add latitude and longitude to customers table
ALTER TABLE customers 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER location,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude,
ADD INDEX idx_customer_location (latitude, longitude);

-- Optional: Add indexes for faster nearby queries
CREATE INDEX idx_vendor_coords ON Vendors(latitude, longitude);
CREATE INDEX idx_customer_coords ON customers(latitude, longitude);

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME IN ('latitude', 'longitude');

SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'customers' AND COLUMN_NAME IN ('latitude', 'longitude');