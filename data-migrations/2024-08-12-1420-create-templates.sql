CREATE TABLE `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` TEXT NOT NULL,
  `ownerId` VARCHAR(255) NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `currentVersion` VARCHAR(16),
  `isDirty` BOOLEAN NOT NULL DEFAULT 1,
  `bestPractice` BOOLEAN NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdById) REFERENCES users(id),
  FOREIGN KEY (modifiedById) REFERENCES users(id),
  INDEX templates_bestPractice_idx (`bestPractice`),
  INDEX templates_owner_idx (`ownerId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `versionedTemplates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `templateId` INT NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT 0,
  `version` VARCHAR(16) NOT NULL,
  `versionType` VARCHAR(16) NOT NULL DEFAULT 'Draft',
  `versionedById` INT NOT NULL,
  `comment` TEXT,
  `name` TEXT NOT NULL,
  `ownerId` VARCHAR(255) NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `bestPractice` BOOLEAN NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (versionedById) REFERENCES users(id),
  INDEX versionedTemplates_active_idx(`active`),
  INDEX versionedTemplates_owner_idx (`ownerId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
