CREATE TABLE `sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `templateId` INT NOT NULL,
  `sourceSectionId` INT,
  `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `isDirty` TINYINT(1) NOT NULL DEFAULT 1,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (sourceSectionId) REFERENCES sections(id),
  FOREIGN KEY (createdById) REFERENCES users(id),
  FOREIGN KEY (modifiedById) REFERENCES users(id),
  INDEX sections_name_idx (`name`),
  INDEX sections_isDirty_idx (`templateId`, `isDirty`),
  INDEX sections_template_idx (`templateId`, `displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `versionedSections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `versionedTemplateId` INT NOT NULL,
  `sectionId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE,
  FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX versionedSections_template_idx (`versionedTemplateId`, `displayOrder`),
  INDEX versionedSections_name_ids (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `sectionTags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sectionId` INT NOT NULL,
  `tagId` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX sectionTags_idx(`sectionId`, `tagId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
