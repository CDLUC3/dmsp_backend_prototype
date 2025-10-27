-- Table to store department information for affiliations
CREATE TABLE IF NOT EXISTS `affiliationDepartments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `abbreviation` VARCHAR(255),
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_affiliationDepts UNIQUE (`affiliationId`, `name`),
  CONSTRAINT fk_affiliationDepts_affiliationId FOREIGN KEY (affiliationId) REFERENCES affiliations (uri)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table to associate users with affiliation departments
CREATE TABLE IF NOT EXISTS `userDepartments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationDepartmentId` INT UNSIGNED NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_userDepts UNIQUE (`affiliationDepartmentId`, `userId`),
  CONSTRAINT fk_userDepts_aDeptId FOREIGN KEY (affiliationDepartmentId) REFERENCES affiliationDepartments (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;
