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
  `image_url` varchar(255) DEFAULT NULL,
  `availability` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`service_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `Services_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Services`
--

LOCK TABLES `Services` WRITE;
/*!40000 ALTER TABLE `Services` DISABLE KEYS */;
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
  `location` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `Vendor_Email` varchar(255) NOT NULL,
  `Vendor_pass` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `Vendors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vendors`
--

LOCK TABLES `Vendors` WRITE;
/*!40000 ALTER TABLE `Vendors` DISABLE KEYS */;
INSERT INTO `Vendors` VALUES (1,NULL,'Maisha Rahman',NULL,NULL,0.0,'maishaproni@gmail.com','$2b$12$X/ZGY3loQevyBVLVpYBnXue8Das5Sv2KfCbmaD1AOw/zjLBu0lRYq','2025-11-03 16:42:00'),(2,NULL,'Maisha Rahman',NULL,NULL,0.0,'maishaRahman@gmail.com','$2b$12$yHKFGvRMWeU/EJfWBwo29uvNAK3v6UWY8vO/TsynYQqPDQLH/9.S6','2025-11-03 16:45:56'),(3,NULL,'Maisha Rahman',NULL,NULL,0.0,'maishaRahman3@gmail.com','$2b$12$p0GTI8Gg0FCkB9.x6rPe7.vhkNId03djQm92eXZrMKBdw3.D3aEQC','2025-11-03 16:47:43'),(4,NULL,'Maisha Rahman Anika',NULL,NULL,0.0,'maishaRahman32@gmail.com','$2b$12$GbHYEu3PRJGYGJEs6waqr.9HwqpLAREl9E5LtLTqWHTUwWBbvAYAe','2025-11-03 16:49:42'),(5,NULL,'Anika Rahman',NULL,NULL,0.0,'anika@gmail.com','$2b$12$6ESUgMIYWNNOBJ0t12yTSe39.EciDRGI8oQDbXNOxB7fME3g8D1Qu','2025-11-03 16:56:40');
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
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,NULL,NULL,NULL,'Maisha Anika','maishaproni@gmail.com','$2b$12$Q30VfgAYXP/ybzuyhDJn3uyJPyP7FQ7OQU2IT1YzBK1z5eJnx7hXG','2025-11-03 14:21:19'),(2,NULL,NULL,NULL,'Anika','proni@gmail.com','$2b$12$MR6DOzsWCOapH8SoAug6SOvvtLcAIXelRk.2H38a6csL5zRpucNxa','2025-11-03 16:57:35');
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

-- Dump completed on 2025-11-04  1:01:26
