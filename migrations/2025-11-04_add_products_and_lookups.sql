/* ----- Lookups ----- */
CREATE TABLE IF NOT EXISTS ProductCategories (
  product_category_id INT NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (product_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ServiceCategories (
  service_category_id INT NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (service_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ----- Seed lookups ----- */
INSERT INTO ProductCategories (slug, name) VALUES
  ('furniture','Furniture'),
  ('painting','Painting'),
  ('decoration','Decoration'),
  ('deshi_mritshilpo','দেশীয় মৃতশিল্প')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO ServiceCategories (slug, name) VALUES
  ('interior_design','Interior Designer'),
  ('electrician','Electrician'),
  ('plumber','Plumber'),
  ('painter','Painter')
ON DUPLICATE KEY UPDATE name = VALUES(name);

/* ----- Vendors: add vendor_type + status (RUN ONCE; skip if already added) ----- */
ALTER TABLE Vendors
  ADD COLUMN vendor_type ENUM('seller','service','both') NULL AFTER category;

ALTER TABLE Vendors
  ADD COLUMN status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active' AFTER created_at;

/* ----- Services: add FK column + timestamp (RUN ONCE; skip if already added) ----- */
ALTER TABLE Services
  ADD COLUMN service_category_id INT NULL AFTER category;

ALTER TABLE Services
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP;

/* Add FK (run once) */
ALTER TABLE Services
  ADD CONSTRAINT fk_services_service_category
    FOREIGN KEY (service_category_id) REFERENCES ServiceCategories(service_category_id);

/* ----- Products and Images ----- */
CREATE TABLE IF NOT EXISTS Products (
  product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  product_category_id INT NOT NULL,
  price_bdt INT NOT NULL CHECK (price_bdt >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status ENUM('draft','active','inactive','deleted') NOT NULL DEFAULT 'active',
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (product_id),
  KEY idx_products_vendor (vendor_id),
  KEY idx_products_category (product_category_id),
  CONSTRAINT fk_products_vendor FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
  CONSTRAINT fk_products_category FOREIGN KEY (product_category_id) REFERENCES ProductCategories(product_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ProductImages (
  product_image_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (product_image_id),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
    REFERENCES Products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ServiceImages (
  service_image_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (service_image_id),
  KEY idx_service_images_service (service_id),
  CONSTRAINT fk_service_images_service FOREIGN KEY (service_id)
    REFERENCES Services(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ----- Product Orders ----- */
CREATE TABLE IF NOT EXISTS ProductOrders (
  product_order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  buyer_name VARCHAR(120),
  buyer_email VARCHAR(100),
  buyer_phone VARCHAR(30),
  status ENUM('pending','paid','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  subtotal_bdt INT NOT NULL DEFAULT 0 CHECK (subtotal_bdt >= 0),
  shipping_bdt INT NOT NULL DEFAULT 0 CHECK (shipping_bdt >= 0),
  total_bdt INT NOT NULL DEFAULT 0 CHECK (total_bdt >= 0),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_order_id),
  KEY idx_product_orders_vendor (vendor_id),
  KEY idx_product_orders_status (status),
  CONSTRAINT fk_product_orders_vendor FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ProductOrderItems (
  product_order_item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  title_snapshot VARCHAR(150) NOT NULL,
  unit_price_bdt INT NOT NULL CHECK (unit_price_bdt >= 0),
  qty INT NOT NULL CHECK (qty > 0),
  line_total_bdt INT AS (unit_price_bdt * qty) STORED,
  PRIMARY KEY (product_order_item_id),
  KEY idx_poi_order (product_order_id),
  KEY idx_poi_product (product_id),
  CONSTRAINT fk_poi_order FOREIGN KEY (product_order_id)
    REFERENCES ProductOrders(product_order_id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product FOREIGN KEY (product_id)
    REFERENCES Products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ----- Analytics (optional) ----- */
CREATE TABLE IF NOT EXISTS AnalyticsEvents (
  analytics_event_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  product_id INT UNSIGNED NULL,
  service_id INT NULL,
  event_type ENUM('view','favorite','add_to_cart','purchase') NOT NULL,
  event_count INT NOT NULL DEFAULT 1 CHECK (event_count > 0),
  occurred_on DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (analytics_event_id),
  KEY idx_analytics_vendor_day (vendor_id, occurred_on),
  KEY idx_analytics_product_day (product_id, occurred_on),
  KEY idx_analytics_service_day (service_id, occurred_on),
  CONSTRAINT fk_analytics_vendor FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
  CONSTRAINT fk_analytics_product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_analytics_service FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ----- Map existing free-text Services.category to lookup (best-effort) ----- */
UPDATE Services s
JOIN ServiceCategories c
  ON LOWER(s.category) = LOWER(c.slug) OR LOWER(s.category) = LOWER(c.name)
SET s.service_category_id = c.service_category_id;

/* ----- Initialize vendor_type (optional) ----- */
UPDATE Vendors v
LEFT JOIN (SELECT DISTINCT vendor_id FROM Services) sv ON sv.vendor_id = v.vendor_id
LEFT JOIN (SELECT DISTINCT vendor_id FROM Products) pv ON pv.vendor_id = v.vendor_id
SET v.vendor_type = CASE
  WHEN sv.vendor_id IS NOT NULL AND pv.vendor_id IS NOT NULL THEN 'both'
  WHEN sv.vendor_id IS NOT NULL THEN 'service'
  WHEN pv.vendor_id IS NOT NULL THEN 'seller'
  ELSE v.vendor_type
END;
