-- ========================
-- 1. Users (Base Table)
-- ========================
CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- hashed
  phone VARCHAR(20),
  role ENUM('customer','vendor','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 2. Customers
-- ========================
CREATE TABLE Customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  address TEXT,
  preferences JSON,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ========================
-- 3. Vendors (Parent table)
-- ========================
CREATE TABLE Vendors (
  vendor_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  business_name VARCHAR(150),
  category ENUM('interior_designer','architect','technician','artist'),
  location VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ========================
-- 4. Interior Designers
-- ========================
CREATE TABLE InteriorDesigners (
  designer_id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT UNIQUE,
  specialization VARCHAR(100),
  portfolio_url VARCHAR(255),
  experience_years INT,
  certifications JSON,
  available_services JSON,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  rating DECIMAL(2,1),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 5. Architects
-- ========================
CREATE TABLE Architects (
  architect_id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT UNIQUE,
  degree VARCHAR(50),
  license_no VARCHAR(100),
  specialization VARCHAR(100),
  software_skills JSON,
  projects_done INT,
  portfolio_url VARCHAR(255),
  consultation_fee DECIMAL(10,2),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 6. Technicians
-- ========================
CREATE TABLE Technicians (
  technician_id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT UNIQUE,
  type ENUM('electrician','plumber','painter'),
  certification VARCHAR(255),
  skills JSON,
  hourly_rate DECIMAL(10,2),
  availability BOOLEAN DEFAULT TRUE,
  emergency_service BOOLEAN DEFAULT FALSE,
  experience_years INT,
  location VARCHAR(100),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 7. Artists
-- ========================
CREATE TABLE Artists (
  artist_id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT UNIQUE,
  art_style VARCHAR(100),
  medium VARCHAR(100),
  portfolio_url VARCHAR(255),
  commission_available BOOLEAN DEFAULT FALSE,
  average_price_range VARCHAR(50),
  exhibitions JSON,
  awards JSON,
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 8. Services / Products
-- ========================
CREATE TABLE Services (
  service_id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT,
  title VARCHAR(150),
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(100),
  image_url VARCHAR(255),
  availability BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 9. Orders
-- ========================
CREATE TABLE Orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  vendor_id INT,
  service_id INT,
  status ENUM('pending','accepted','completed','canceled') DEFAULT 'pending',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
  FOREIGN KEY (service_id) REFERENCES Services(service_id)
);

-- ========================
-- 10. Reviews
-- ========================
CREATE TABLE Reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  vendor_id INT,
  rating DECIMAL(2,1),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- ========================
-- 11. Blogs
-- ========================
CREATE TABLE Blogs (
  blog_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  content TEXT,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES Users(user_id)
);

-- ========================
-- 12. Chat Sessions
-- ========================
CREATE TABLE Chats (
  chat_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  vendor_id INT,
  order_id INT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','closed','blocked') DEFAULT 'active',
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
  FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- ========================
-- 13. Chat Messages
-- ========================
CREATE TABLE ChatMessages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id INT,
  sender_id INT,
  receiver_id INT,
  message_text TEXT,
  attachment_url VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (chat_id) REFERENCES Chats(chat_id),
  FOREIGN KEY (sender_id) REFERENCES Users(user_id),
  FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);

-- ========================
-- 14. Notifications
-- ========================
CREATE TABLE Notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  message_preview VARCHAR(255),
  is_seen BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
