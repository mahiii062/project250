/* ===========================
   Add vendor geolocation
   =========================== */

ALTER TABLE Vendors
  ADD COLUMN latitude  DECIMAL(9,6) NULL AFTER location,
  ADD COLUMN longitude DECIMAL(9,6) NULL AFTER latitude;

-- Helpful index for map queries
CREATE INDEX idx_vendors_lat_lon ON Vendors(latitude, longitude);

-- (Optional) add some demo coordinates (Dhaka-ish) so the map has data
-- Replace with your real vendors as needed.
UPDATE Vendors SET latitude = 23.780887, longitude = 90.279239 WHERE vendor_id = 12; -- minaaa (seller)
UPDATE Vendors SET latitude = 23.763912, longitude = 90.389915 WHERE vendor_id = 13; -- Rahi Mojumdar (service)
UPDATE Vendors SET latitude = 23.745650, longitude = 90.376015 WHERE vendor_id = 14; -- Abdul Karim (service);
