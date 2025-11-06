-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: nibashDB
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AnalyticsEvents`
--

DROP TABLE IF EXISTS `AnalyticsEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AnalyticsEvents` (
  `analytics_event_id` int unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `product_id` int unsigned DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `event_type` enum('view','favorite','add_to_cart','purchase') NOT NULL,
  `event_count` int NOT NULL DEFAULT '1',
  `occurred_on` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`analytics_event_id`),
  KEY `idx_analytics_vendor_day` (`vendor_id`,`occurred_on`),
  KEY `idx_analytics_product_day` (`product_id`,`occurred_on`),
  KEY `idx_analytics_service_day` (`service_id`,`occurred_on`),
  CONSTRAINT `fk_analytics_product` FOREIGN KEY (`product_id`) REFERENCES `Products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_analytics_service` FOREIGN KEY (`service_id`) REFERENCES `Services` (`service_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_analytics_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`),
  CONSTRAINT `AnalyticsEvents_chk_1` CHECK ((`event_count` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AnalyticsEvents`
--

LOCK TABLES `AnalyticsEvents` WRITE;
/*!40000 ALTER TABLE `AnalyticsEvents` DISABLE KEYS */;
/*!40000 ALTER TABLE `AnalyticsEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Artists`
--

DROP TABLE IF EXISTS `Artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Artists` (
  `artist_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `art_style` varchar(100) DEFAULT NULL,
  `medium` varchar(100) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `commission_available` tinyint(1) DEFAULT '0',
  `average_price_range` varchar(50) DEFAULT NULL,
  `exhibitions` json DEFAULT NULL,
  `awards` json DEFAULT NULL,
  PRIMARY KEY (`artist_id`),
  UNIQUE KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `Artists_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Artists`
--

LOCK TABLES `Artists` WRITE;
/*!40000 ALTER TABLE `Artists` DISABLE KEYS */;
/*!40000 ALTER TABLE `Artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Blogs`
--

DROP TABLE IF EXISTS `Blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Blogs` (
  `blog_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `content` text,
  `author_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`blog_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `Blogs_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Blogs`
--

LOCK TABLES `Blogs` WRITE;
/*!40000 ALTER TABLE `Blogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `Blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChatMessages`
--

DROP TABLE IF EXISTS `ChatMessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatMessages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `chat_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `message_text` text,
  `attachment_url` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`message_id`),
  KEY `chat_id` (`chat_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `ChatMessages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `Chats` (`chat_id`),
  CONSTRAINT `ChatMessages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `ChatMessages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChatMessages`
--

LOCK TABLES `ChatMessages` WRITE;
/*!40000 ALTER TABLE `ChatMessages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ChatMessages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Chats`
--

DROP TABLE IF EXISTS `Chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Chats` (
  `chat_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','closed','blocked') DEFAULT 'active',
  PRIMARY KEY (`chat_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `Chats_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`),
  CONSTRAINT `Chats_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Chats`
--

LOCK TABLES `Chats` WRITE;
/*!40000 ALTER TABLE `Chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `Chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InteriorDesigners`
--

DROP TABLE IF EXISTS `InteriorDesigners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `InteriorDesigners` (
  `designer_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `certifications` json DEFAULT NULL,
  `available_services` json DEFAULT NULL,
  `price_range_min` decimal(10,2) DEFAULT NULL,
  `price_range_max` decimal(10,2) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  PRIMARY KEY (`designer_id`),
  UNIQUE KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `InteriorDesigners_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InteriorDesigners`
--

LOCK TABLES `InteriorDesigners` WRITE;
/*!40000 ALTER TABLE `InteriorDesigners` DISABLE KEYS */;
/*!40000 ALTER TABLE `InteriorDesigners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `message_preview` varchar(255) DEFAULT NULL,
  `is_seen` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `status` enum('pending','accepted','completed','canceled') DEFAULT 'pending',
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `Orders_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`),
  CONSTRAINT `Orders_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `Services` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductCategories`
--

DROP TABLE IF EXISTS `ProductCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductCategories` (
  `product_category_id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(64) NOT NULL,
  `name` varchar(120) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`product_category_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductCategories`
--

LOCK TABLES `ProductCategories` WRITE;
/*!40000 ALTER TABLE `ProductCategories` DISABLE KEYS */;
INSERT INTO `ProductCategories` VALUES (1,'furniture','Furniture',1),(2,'painting','Painting',1),(3,'decoration','Decoration',1),(4,'deshi_mritshilpo','দেশীয় মৃতশিল্প',1);
/*!40000 ALTER TABLE `ProductCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductImages`
--

DROP TABLE IF EXISTS `ProductImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductImages` (
  `product_image_id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_image_id`),
  KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `Products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductImages`
--

LOCK TABLES `ProductImages` WRITE;
/*!40000 ALTER TABLE `ProductImages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductImages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductOrderItems`
--

DROP TABLE IF EXISTS `ProductOrderItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductOrderItems` (
  `product_order_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `title_snapshot` varchar(150) NOT NULL,
  `unit_price_bdt` int NOT NULL,
  `qty` int NOT NULL,
  `line_total_bdt` int GENERATED ALWAYS AS ((`unit_price_bdt` * `qty`)) STORED,
  PRIMARY KEY (`product_order_item_id`),
  KEY `idx_poi_order` (`product_order_id`),
  KEY `idx_poi_product` (`product_id`),
  CONSTRAINT `fk_poi_order` FOREIGN KEY (`product_order_id`) REFERENCES `ProductOrders` (`product_order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_poi_product` FOREIGN KEY (`product_id`) REFERENCES `Products` (`product_id`) ON DELETE RESTRICT,
  CONSTRAINT `ProductOrderItems_chk_1` CHECK ((`unit_price_bdt` >= 0)),
  CONSTRAINT `ProductOrderItems_chk_2` CHECK ((`qty` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductOrderItems`
--

LOCK TABLES `ProductOrderItems` WRITE;
/*!40000 ALTER TABLE `ProductOrderItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductOrderItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductOrders`
--

DROP TABLE IF EXISTS `ProductOrders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductOrders` (
  `product_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `buyer_name` varchar(120) DEFAULT NULL,
  `buyer_email` varchar(100) DEFAULT NULL,
  `buyer_phone` varchar(30) DEFAULT NULL,
  `status` enum('pending','paid','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal_bdt` int NOT NULL DEFAULT '0',
  `shipping_bdt` int NOT NULL DEFAULT '0',
  `total_bdt` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_order_id`),
  KEY `idx_product_orders_vendor` (`vendor_id`),
  KEY `idx_product_orders_status` (`status`),
  CONSTRAINT `fk_product_orders_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`),
  CONSTRAINT `ProductOrders_chk_1` CHECK ((`subtotal_bdt` >= 0)),
  CONSTRAINT `ProductOrders_chk_2` CHECK ((`shipping_bdt` >= 0)),
  CONSTRAINT `ProductOrders_chk_3` CHECK ((`total_bdt` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductOrders`
--

LOCK TABLES `ProductOrders` WRITE;
/*!40000 ALTER TABLE `ProductOrders` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductOrders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Products` (
  `product_id` int unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `product_category_id` int NOT NULL,
  `price_bdt` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `status` enum('draft','active','inactive','deleted') NOT NULL DEFAULT 'active',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `idx_products_vendor` (`vendor_id`),
  KEY `idx_products_category` (`product_category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`product_category_id`) REFERENCES `ProductCategories` (`product_category_id`),
  CONSTRAINT `fk_products_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`),
  CONSTRAINT `Products_chk_1` CHECK ((`price_bdt` >= 0)),
  CONSTRAINT `Products_chk_2` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,1,'Study Desk','study desk',1,2500,10,'active','https://images-cdn.ubuy.co.in/66266ca89a863a63db468363-ktaxon-writing-computer-desk-modern.jpg','2025-11-03 20:21:38','2025-11-03 20:21:38',NULL),(2,9,'Study Desk','wooden table',1,2500,10,'active','https://images-cdn.ubuy.co.in/66266ca89a863a63db468363-ktaxon-writing-computer-desk-modern.jpg','2025-11-04 11:06:17','2025-11-04 11:06:17',NULL),(3,10,'Study Desk','desk',1,2500,10,'active','https://images-cdn.ubuy.co.in/66266ca89a863a63db468363-ktaxon-writing-computer-desk-modern.jpg','2025-11-04 11:51:59','2025-11-04 11:51:59',NULL),(4,11,'Study Desk','desk',1,2500,10,'active','https://images-cdn.ubuy.co.in/66266ca89a863a63db468363-ktaxon-writing-computer-desk-modern.jpg','2025-11-04 12:32:13','2025-11-04 12:32:13',NULL),(5,12,'vase','colourful flower vase',3,300,25,'active','https://www.bohaglass.co.uk/wp-content/uploads/2020/12/Murano_Colourful_-Vase-Realizzato-Tall-Vase.jpg','2025-11-04 13:05:32','2025-11-04 13:05:32',NULL),(6,12,'Modern Blue Vase 01','Beautiful Blue vase medium size, made of ceramic',3,700,20,'active','https://awalexpressbd.com/wp-content/uploads/2024/02/SURIYA-VASE-N.-Blue.webp','2025-11-04 13:08:46','2025-11-04 13:08:46',NULL);
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reviews`
--

DROP TABLE IF EXISTS `Reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reviews`
--

LOCK TABLES `Reviews` WRITE;
/*!40000 ALTER TABLE `Reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceCategories`
--

DROP TABLE IF EXISTS `ServiceCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceCategories` (
  `service_category_id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(64) NOT NULL,
  `name` varchar(120) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`service_category_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceCategories`
--

LOCK TABLES `ServiceCategories` WRITE;
/*!40000 ALTER TABLE `ServiceCategories` DISABLE KEYS */;
INSERT INTO `ServiceCategories` VALUES (1,'interior_design','Interior Designer',1),(2,'electrician','Electrician',1),(3,'plumber','Plumber',1),(4,'painter','Painter',1);
/*!40000 ALTER TABLE `ServiceCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceImages`
--

DROP TABLE IF EXISTS `ServiceImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceImages` (
  `service_image_id` int unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`service_image_id`),
  KEY `idx_service_images_service` (`service_id`),
  CONSTRAINT `fk_service_images_service` FOREIGN KEY (`service_id`) REFERENCES `Services` (`service_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceImages`
--

LOCK TABLES `ServiceImages` WRITE;
/*!40000 ALTER TABLE `ServiceImages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ServiceImages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Services`
--

DROP TABLE IF EXISTS `Services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `service_category_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `availability` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `fk_services_service_category` (`service_category_id`),
  CONSTRAINT `fk_services_service_category` FOREIGN KEY (`service_category_id`) REFERENCES `ServiceCategories` (`service_category_id`),
  CONSTRAINT `Services_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Services`
--

LOCK TABLES `Services` WRITE;
/*!40000 ALTER TABLE `Services` DISABLE KEYS */;
INSERT INTO `Services` VALUES (1,13,'Rahi Mojumdar Studio','Creative interior designer with a passion for crafting inspiring, functional spaces. Open to new opportunities in residential and commercial design. Let’s build something beautiful together.',500.00,NULL,1,NULL,1,'2025-11-04 13:16:40'),(2,14,'Abdul Karim','Skilled electrician with hands-on experience in residential and commercial wiring, maintenance, and electrical installations. Dedicated to safety, efficiency, and delivering reliable power solutions.',2000.00,NULL,2,NULL,1,'2025-11-04 14:01:47'),(3,14,'Modern Kitchen','Beautiful modern kitchen',40000.00,NULL,1,'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png',1,'2025-11-04 14:38:41');
/*!40000 ALTER TABLE `Services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Technicians`
--

DROP TABLE IF EXISTS `Technicians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Technicians` (
  `technician_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `type` enum('electrician','plumber','painter') DEFAULT NULL,
  `certification` varchar(255) DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `availability` tinyint(1) DEFAULT '1',
  `emergency_service` tinyint(1) DEFAULT '0',
  `experience_years` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `Rating` float DEFAULT NULL,
  PRIMARY KEY (`technician_id`),
  UNIQUE KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `Technicians_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Technicians`
--

LOCK TABLES `Technicians` WRITE;
/*!40000 ALTER TABLE `Technicians` DISABLE KEYS */;
/*!40000 ALTER TABLE `Technicians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','vendor','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Vendors`
--

DROP TABLE IF EXISTS `Vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vendors` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `Vendor_Name` varchar(255) DEFAULT NULL,
  `category` enum('interior_designer','architect','technician','artist') DEFAULT NULL,
  `vendor_type` enum('seller','service','both') DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `Vendor_Email` varchar(255) NOT NULL,
  `Vendor_pass` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','suspended','deleted') NOT NULL DEFAULT 'active',
  `phone` varchar(30) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `Vendor_description` varchar(2045) DEFAULT NULL,
  `Vendorscol` varchar(45) DEFAULT NULL,
  `job_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `Vendors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vendors`
--

LOCK TABLES `Vendors` WRITE;
/*!40000 ALTER TABLE `Vendors` DISABLE KEYS */;
INSERT INTO `Vendors` VALUES (1,NULL,'Maisha Rahman',NULL,'seller',NULL,0.0,'maishaproni@gmail.com','$2b$12$X/ZGY3loQevyBVLVpYBnXue8Das5Sv2KfCbmaD1AOw/zjLBu0lRYq','2025-11-03 16:42:00','active',NULL,NULL,NULL,NULL,NULL),(2,NULL,'Maisha Rahman',NULL,NULL,NULL,0.0,'maishaRahman@gmail.com','$2b$12$yHKFGvRMWeU/EJfWBwo29uvNAK3v6UWY8vO/TsynYQqPDQLH/9.S6','2025-11-03 16:45:56','active',NULL,NULL,NULL,NULL,NULL),(3,NULL,'Maisha Rahman',NULL,NULL,NULL,0.0,'maishaRahman3@gmail.com','$2b$12$p0GTI8Gg0FCkB9.x6rPe7.vhkNId03djQm92eXZrMKBdw3.D3aEQC','2025-11-03 16:47:43','active',NULL,NULL,NULL,NULL,NULL),(4,NULL,'Maisha Rahman Anika',NULL,NULL,NULL,0.0,'maishaRahman32@gmail.com','$2b$12$GbHYEu3PRJGYGJEs6waqr.9HwqpLAREl9E5LtLTqWHTUwWBbvAYAe','2025-11-03 16:49:42','active',NULL,NULL,NULL,NULL,NULL),(5,NULL,'Anika Rahman',NULL,NULL,NULL,0.0,'anika@gmail.com','$2b$12$6ESUgMIYWNNOBJ0t12yTSe39.EciDRGI8oQDbXNOxB7fME3g8D1Qu','2025-11-03 16:56:40','active',NULL,NULL,NULL,NULL,NULL),(6,NULL,'Meherin',NULL,NULL,NULL,0.0,'meherin@gmail.com','$2b$12$LwQTimEqAqVfDIkENA22POqtGNOlFQMq9XRwZhAjVebJSmxkbAMKG','2025-11-03 19:12:52','active',NULL,NULL,NULL,NULL,NULL),(7,NULL,'Meherina',NULL,NULL,NULL,0.0,'meherin2@gmail.com','$2b$12$Xeh.t8MQwsMsmncS9OxP0eYSGW/ljSgqSh6W5Z2XRP7qd1wg7IRii','2025-11-03 20:05:44','active',NULL,NULL,NULL,NULL,NULL),(8,NULL,'Meherina Begum',NULL,NULL,NULL,0.0,'meherin23@gmail.com','$2b$12$nd2WF7XTNyrVfG/6KSGRCuNSxZV4sBPTqLtP9NyKHSbPPf.COgvKa','2025-11-03 20:15:42','active',NULL,NULL,NULL,NULL,NULL),(9,NULL,'mina',NULL,'seller',NULL,0.0,'mina@gmail.com','$2b$12$hMjLcbJY506MWqutk3JZfeYSROscir4bZXVtNmAmM3jXUA8ZASdNe','2025-11-04 11:05:42','active',NULL,NULL,NULL,NULL,NULL),(10,NULL,'mina rahman',NULL,NULL,NULL,0.0,'mina2@gmail.com','$2b$12$bgdFDhQYJO1ZLzCrCc8ffeinF4XCozlrIXWBiC9yvutzIoT9M0ovS','2025-11-04 11:31:33','active',NULL,NULL,NULL,NULL,NULL),(11,NULL,'minaa',NULL,NULL,NULL,0.0,'minaa@gmail.com','$2b$12$/dk6k5Dk85ch2PueEPnl8eJ/hqYB11YS4hKG0ahVlJjaTDMVKiOKC','2025-11-04 12:02:03','active',NULL,NULL,NULL,NULL,NULL),(12,NULL,'minaaa',NULL,'seller','Dhaka',0.0,'minaaa@gmail.com','$2b$12$LTqv7MHHJSIejHHfM7LFwOWB063A/zJVU2uw59S0wda1bmYcclTYa','2025-11-04 13:01:47','active','016061144196',NULL,NULL,NULL,NULL),(13,NULL,'Rahi Mojumdar',NULL,'service','Dhaka',0.0,'rahimojumdar@gmail.com','$2b$12$bIYdUZ9v1mPjNfhKR41rEu2ZDCzm8DO/UJ45D2dY6eP1WyA5/k0Xq','2025-11-04 13:10:15','active','01987651243',NULL,NULL,NULL,NULL),(14,NULL,'Abdul Karim',NULL,'service','Dhaka',0.0,'abdulkarim@gmail.com','$2b$12$U4738/sWpJlleokFcMavkOl9qkqeJqswXYPmnXsDu9LSCj30yr1FS','2025-11-04 13:59:51','active','01666666666','https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png',NULL,NULL,NULL),(15,NULL,'Acme Studio',NULL,NULL,'Dhaka, BD',0.0,'studio@example.com','$2b$12$chYUEXkzFpbfcqG2GZ6J5O7Fgp7eyTOTKQkBEci.dOGb078H8PRnu','2025-11-04 14:56:21','active','0123456789',NULL,NULL,NULL,NULL),(16,NULL,'kalam',NULL,NULL,'Dhaka, BD',0.0,'kalam@gmail.com','$2b$12$.slLb4N3d4t6dIm50fWBFu/PFvptRlSCudaROs8oRlvXbqUJYr302','2025-11-06 14:33:09','active','0123456789',NULL,'plumber',NULL,'Plumber'),(17,NULL,'manush',NULL,NULL,NULL,0.0,'manush@gmail.com','$2b$12$UtYzDbjN5xmHIq8hOoNa3eGxx26UWDkSKtJ.w5/SGdrgFI4rrOO5O','2025-11-06 15:42:58','active',NULL,NULL,NULL,NULL,NULL),(18,NULL,'rahim',NULL,NULL,'Dhaka',0.0,'rahim@gmail.com','$2b$12$pxxsRKz0tYm3/XtunQChIu3RCyEwToGi/MPhp5Bsxgm4HbS1f1eIS','2025-11-06 15:46:56','active','01234567890',NULL,'painter ami',NULL,'Painter'),(19,NULL,'romeo',NULL,NULL,'Dhaka',0.0,'romeo@gmail.com','$2b$12$VjTgEy0l6ohv3em8UnTaOOt30ULCVbjV/Q2mfalHH8WBN.0vzLuL2','2025-11-06 16:15:33','active','016098765423',NULL,'carpenter',NULL,'Carpenter');
/*!40000 ALTER TABLE `Vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `address` text,
  `preferences` json DEFAULT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Customer_Email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `location` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `avatar_url` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,NULL,NULL,NULL,'Maisha','maishaproni@gmail.com','$2b$12$Q30VfgAYXP/ybzuyhDJn3uyJPyP7FQ7OQU2IT1YzBK1z5eJnx7hXG','2025-11-03 14:21:19','Dhaka','016061144196','https://sm.ign.com/t/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.600.jpg','2025-11-06 14:31:11'),(2,NULL,NULL,NULL,'Anika','proni@gmail.com','$2b$12$MR6DOzsWCOapH8SoAug6SOvvtLcAIXelRk.2H38a6csL5zRpucNxa','2025-11-03 16:57:35',NULL,NULL,NULL,'2025-11-04 18:11:04'),(3,NULL,NULL,NULL,'Anika','anikaaa@gmail.com','$2b$12$rAvtGrTb7EHHAnvjk7f9e.BokJI/aBurfuRC8V1h0RCMj1nHDBV8q','2025-11-04 14:19:04',NULL,NULL,NULL,'2025-11-04 18:11:04'),(4,NULL,NULL,NULL,'kira','kiii@gmail.com','$2b$12$VWnATqIE3KFqqtrF2qJ4l.oxv4fLVwgcYqiPyyDUgv/LiAFZRJ3rm','2025-11-06 15:43:17','Sylhet','1234559697',NULL,'2025-11-06 15:43:36'),(5,NULL,NULL,NULL,'minaaa','mai@gmail.com','$2b$12$Z2knzqCKTW7nLQuBxFgciO4c1FsVwcMQr7/cYExmyquZDxx3ZhnW6','2025-11-06 15:45:52','Sylhet','01324578677',NULL,'2025-11-06 15:46:18'),(6,NULL,NULL,NULL,'oishy','oishy@gmail.com','$2b$12$RzAAu1FtsYP4l7v0fzFZKu8AINYaLpte22qhPVm4RRwfMImyKB//y','2025-11-06 16:21:12','Sylhet','01324578677',NULL,'2025-11-06 16:21:39');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-06 23:07:01
