# Table to store associations between a template and an organizations customizations
CREATE TABLE IF NOT EXISTS `templateCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `templateId` INT NOT NULL,
  `currentVersionedTemplateId` INT NOT NULL,
  `priorVersionedTemplateId` INT NULL,
  `status` VARCHAR(8) NOT NULL DEFAULT 'OK',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_templateCusts UNIQUE (`affiliationId`, `templateId`),
  CONSTRAINT fk_templateCust_affiliationId FOREIGN KEY (affiliationId) REFERENCES affiliations (uri),
  CONSTRAINT fk_templateCust_templateId FOREIGN KEY (templateId) REFERENCES templates (id),
  CONSTRAINT fk_templateCust_currentId FOREIGN KEY (currentVersionedTemplateId) REFERENCES versionedTemplates (id),
  CONSTRAINT fk_templateCust_priorId FOREIGN KEY (priorVersionedTemplateId) REFERENCES versionedTemplates (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom sections that are added to a published template
CREATE TABLE IF NOT EXISTS `customSections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `currentPinnedVersionedSectionId` INT NOT NULL,
  `priorPinnedVersionedSectionId` INT NULL,
  `status` VARCHAR(8) NOT NULL DEFAULT 'OK',
  `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customSecs_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_customSecs_currentId FOREIGN KEY (currentPinnedVersionedSectionId) REFERENCES versionedSections (id),
  CONSTRAINT fk_customSecs_priorId FOREIGN KEY (priorPinnedVersionedSectionId) REFERENCES versionedSections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom questions that are added to a published template
CREATE TABLE IF NOT EXISTS `customQuestions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `status` VARCHAR(8) NOT NULL DEFAULT 'OK',

  # Questions can be attached to a customSection. If so, these columns are applicable:
  `customSectionId` INT UNSIGNED NULL,
  `displayOrder` INT NULL,

  # Questions can be attached to a question that is part of the published Template
  # If so, these columns are applicable:
  `currentPinnedVersionedQuestionId` INT NULL,
  `priorPinnedVersionedQuestionId` INT NULL,

  `questionTypeId` INT NOT NULL,
  `questionText` TEXT NOT NULL,
  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customQs_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_customQs_sectionId FOREIGN KEY (customSectionId) REFERENCES customSections (id),
  CONSTRAINT fk_customQs_currentId FOREIGN KEY (currentPinnedVersionedQuestionId) REFERENCES versionedQuestions (id),
  CONSTRAINT fk_customQs_priorId FOREIGN KEY (priorPinnedVersionedQuestionId) REFERENCES versionedQuestions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance and requirements for a section in a published template
CREATE TABLE IF NOT EXISTS `sectionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `sectionId` INT NOT NULL,
  `currentVersionedSectionId` INT NOT NULL,
  `priorVersionedSectionId` INT NULL,
  `status` VARCHAR(8) NOT NULL DEFAULT 'OK',
  `requirements` TEXT NULL,
  `guidance` TEXT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_sectionCusts UNIQUE (`templateCustomizationId`, `sectionId`),
  CONSTRAINT fk_sectionCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_sectionCust_sectionId FOREIGN KEY (sectionId) REFERENCES sections (id),
  CONSTRAINT fk_sectionCust_currentId FOREIGN KEY (currentVersionedSectionId) REFERENCES versionedSections (id),
  CONSTRAINT fk_sectionCust_priorId FOREIGN KEY (priorVersionedSectionId) REFERENCES versionedSections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance, requirements and sample text for a section in a published template
CREATE TABLE IF NOT EXISTS `questionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `questionId` INT NOT NULL,
  `currentVersionedQuestionId` INT NOT NULL,
  `priorVersionedQuestionId` INT NULL,
  `status` VARCHAR(8) NOT NULL DEFAULT 'OK',
  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_questionCusts UNIQUE (`templateCustomizationId`, `questionId`),
  CONSTRAINT fk_qCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_qCust_questionId FOREIGN KEY (questionId) REFERENCES questions (id),
  CONSTRAINT fk_qCust_currentId FOREIGN KEY (currentVersionedQuestionId) REFERENCES versionedQuestions (id),
  CONSTRAINT fk_qCust_priorId FOREIGN KEY (priorVersionedQuestionId) REFERENCES versionedQuestions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;
