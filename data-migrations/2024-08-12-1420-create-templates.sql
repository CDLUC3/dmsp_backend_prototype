CREATE TABLE `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` TEXT NOT NULL,
  `affiliationId` VARCHAR(255) NOT NULL,
  `ownerId` INT NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `currentVersion` VARCHAR(16),
  `isDirty` BOOLEAN NOT NULL DEFAULT 1,
  `bestPractice` BOOLEAN NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id),
  INDEX templates_bestPractice_idx (`bestPractice`),
  INDEX templates_affiliation_idx (`affiliationId`),
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
  `affiliationId` VARCHAR(255) NOT NULL,
  `ownerId` INT NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `bestPractice` BOOLEAN NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (ownerId) REFERENCES users(id),
  FOREIGN KEY (versionedById) REFERENCES users(id),
  INDEX versionedTemplates_active_idx(`active`),
  INDEX versionedTemplates_affiliation_idx (`affiliationId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
