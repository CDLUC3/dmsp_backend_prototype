CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` VARCHAR(16) NOT NULL DEFAULT 'RESEARCHER',
  `givenName` VARCHAR(255) NOT NULL,
  `surName` VARCHAR(255) NOT NULL,
  `affiliationId` VARCHAR(255) NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  CONSTRAINT unique_email UNIQUE (`email`),
  INDEX users_surName_idx (`surName`),
  INDEX users_affiliation_idx (`affiliationId`),
  INDEX users_role_idx (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;