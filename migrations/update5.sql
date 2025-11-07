-- ===== fix incompatible foreign keys =====
-- If your previous create failed, these DROPs are harmless.
DROP VIEW IF EXISTS vendor_rating_stats;
DROP VIEW IF EXISTS product_rating_stats;
DROP TABLE IF EXISTS vendor_ratings;
DROP TABLE IF EXISTS product_ratings;

-- Vendor ratings: match child column types to parent tables
-- Assumptions from your notes:
-- - customers.customer_id : INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
-- - Vendors.vendor_id     : INT (likely signed) AUTO_INCREMENT PRIMARY KEY
--   (If your Vendors.vendor_id is UNSIGNED too, change vendor_ratings.vendor_id below to INT UNSIGNED)

CREATE TABLE vendor_ratings (
  rating_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendor_id   INT           NOT NULL,        -- make UNSIGNED if Vendors.vendor_id is UNSIGNED
  customer_id INT UNSIGNED  NOT NULL,        -- MUST be UNSIGNED to match customers.customer_id
  rating      TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vendor_customer (vendor_id, customer_id),
  INDEX idx_vr_vendor (vendor_id),
  INDEX idx_vr_customer (customer_id),
  CONSTRAINT fk_vr_vendor
    FOREIGN KEY (vendor_id)   REFERENCES Vendors(vendor_id)     ON DELETE CASCADE,
  CONSTRAINT fk_vr_customer
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product ratings (adjust signedness to match your Products.product_id)
-- If Products.product_id is UNSIGNED, change product_id here to INT UNSIGNED.
CREATE TABLE product_ratings (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED  NOT NULL,  -- make UNSIGNED if Products.product_id is UNSIGNED
  customer_id INT UNSIGNED  NOT NULL,  -- to match customers.customer_id
  rating      TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_product_customer (product_id, customer_id),
  INDEX idx_pr_product (product_id),
  INDEX idx_pr_customer (customer_id),
  CONSTRAINT fk_pr_product
    FOREIGN KEY (product_id)  REFERENCES Products(product_id)   ON DELETE CASCADE,
  CONSTRAINT fk_pr_customer
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Views
CREATE OR REPLACE VIEW vendor_rating_stats AS
SELECT
  v.vendor_id,
  COALESCE(ROUND(AVG(vr.rating), 1), 0.0) AS avg_rating,
  COUNT(vr.rating_id) AS rating_count
FROM Vendors v
LEFT JOIN vendor_ratings vr ON vr.vendor_id = v.vendor_id
GROUP BY v.vendor_id;

CREATE OR REPLACE VIEW product_rating_stats AS
SELECT
  p.product_id,
  COALESCE(ROUND(AVG(pr.rating), 1), 0.0) AS avg_rating,
  COUNT(pr.id) AS rating_count
FROM Products p
LEFT JOIN product_ratings pr ON pr.product_id = p.product_id
GROUP BY p.product_id;

-- Helpful geo indexes (no-op if they already exist)
CREATE INDEX idx_vendors_lat_lng ON Vendors(latitude, longitude);
