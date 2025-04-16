CREATE TABLE key_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE `token_keys` (
  `key` VARCHAR(50) PRIMARY KEY
);

CREATE TABLE `redeemed_keys` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `total_executed` INT DEFAULT 0,
  `hwid` VARCHAR(255),
  `tokens` INT DEFAULT 3,
  `last_claimed` DATETIME DEFAULT NULL
);

CREATE TABLE `blacklisted_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key_value` VARCHAR(255) NOT NULL,
  `reason` TEXT NOT NULL,
  `blacklisted_by` VARCHAR(255),
  `discord_user_id` VARCHAR(255),
  `redeemed_by` VARCHAR(255),
  `redeemed_user_id` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `expired_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key_value` VARCHAR(255) NOT NULL,
  `reason` TEXT NOT NULL,
  `expired_by` VARCHAR(255),
  `discord_user_id` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expire_date` TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whitelist (
  user_id VARCHAR(255) PRIMARY KEY
);
