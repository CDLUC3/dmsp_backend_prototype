CREATE TABLE `questionTypes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `usageDescription` text,
  `isDefault` boolean NOT NULL DEFAULT false,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  CONSTRAINT unique_name UNIQUE (`name`),
  INDEX questionTypes_name_idx (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
