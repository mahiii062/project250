-- Fix for reserved word "Groups" and PK with NULLs.
-- Uses non-reserved names and a solid GroupMembers schema.

SET @DB := DATABASE();

-- If an old bad table named `Groups` exists, rename it to back it up
SET @sql := IF (
  (SELECT COUNT(*) FROM information_schema.TABLES
     WHERE TABLE_SCHEMA=@DB AND TABLE_NAME='Groups') = 1,
  'RENAME TABLE `Groups` TO `Groups__old_reserved_backup`',
  'DO 0'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ===== ChatGroups (replaces Groups) =====
CREATE TABLE IF NOT EXISTS ChatGroups (
  chat_group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_name    VARCHAR(120) NOT NULL,
  created_by    INT NULL, -- customer_id (optional)
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If a previous GroupMembers exists with the old shape, back it up
SET @sql := IF (
  (SELECT COUNT(*) FROM information_schema.TABLES
     WHERE TABLE_SCHEMA=@DB AND TABLE_NAME='GroupMembers') = 1,
  'RENAME TABLE `GroupMembers` TO `GroupMembers__old_backup`',
  'DO 0'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ===== GroupMembers (new shape) =====
-- We use a NOT NULL composite key: (chat_group_id, member_kind, member_id)
-- member_kind = 'customer' | 'vendor'
CREATE TABLE IF NOT EXISTS GroupMembers (
  chat_group_id INT NOT NULL,
  member_kind   ENUM('customer','vendor') NOT NULL,
  member_id     INT NOT NULL,
  role          ENUM('member','admin') DEFAULT 'member',
  PRIMARY KEY (chat_group_id, member_kind, member_id),
  FOREIGN KEY (chat_group_id) REFERENCES ChatGroups(chat_group_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If a previous Messages exists with old FK to Groups, back it up
SET @sql := IF (
  (SELECT COUNT(*) FROM information_schema.TABLES
     WHERE TABLE_SCHEMA=@DB AND TABLE_NAME='Messages') = 1 AND
  (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA=@DB AND TABLE_NAME='Messages' AND COLUMN_NAME='group_id') = 1,
  'RENAME TABLE `Messages` TO `Messages__old_backup`',
  'DO 0'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ===== Messages (DM or group) =====
-- DM rows: chat_group_id = NULL, (vendor_id, customer_id) set
-- Group rows: chat_group_id set, vendor_id/customer_id optional
CREATE TABLE IF NOT EXISTS Messages (
  message_id    INT AUTO_INCREMENT PRIMARY KEY,
  chat_group_id INT NULL,
  vendor_id     INT NULL,
  customer_id   INT NULL,
  body          TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_group_id) REFERENCES ChatGroups(chat_group_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
