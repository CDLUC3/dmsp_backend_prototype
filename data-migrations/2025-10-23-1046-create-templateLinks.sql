-- Tables to store template links
CREATE TABLE IF NOT EXISTS `templateLinks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateId` INT UNSIGNED NOT NULL,
  `linkType` VARCHAR(255) NOT NULL DEFAULT 'FUNDER', -- Other option is 'SAMPLE_PLAN'
  `url` VARCHAR(255),
  `text` VARCHAR(255),
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_templateLinks UNIQUE (`templateId`, `url`),
  CONSTRAINT fk_templateLinks_templateId FOREIGN KEY (templateId) REFERENCES templates (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `versionedTemplateLinks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `versionedTemplateId` INT UNSIGNED NOT NULL,
  `linkType` VARCHAR(255) NOT NULL DEFAULT 'FUNDER', -- Other option is 'SAMPLE_PLAN'
  `url` VARCHAR(255),
  `text` VARCHAR(255),
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vtemplateLinks UNIQUE (`versionedTemplateId`, `url`),
  CONSTRAINT fk_vtemplateLinks_vtemplateId FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
