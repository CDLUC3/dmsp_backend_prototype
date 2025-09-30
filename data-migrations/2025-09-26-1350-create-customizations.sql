# Root customization tables
# ---------------------------------------------

# Table to store associations between a template and an organizations customizations
CREATE TABLE IF NOT EXISTS `templateCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `templateId` INT NOT NULL,     # Pointer to the template being customized
  `status` VARCHAR(8) NOT NULL DEFAULT 'DRAFT', # DRAFT, PUBLISHED, ARCHIVED
  `migrationStatus` VARCHAR(8) NOT NULL DEFAULT 'OK',    # OK, STALE, ORPHANED
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_templateCusts UNIQUE (`affiliationId`, `templateId`),
  CONSTRAINT fk_templateCust_affiliationId FOREIGN KEY (affiliationId) REFERENCES affiliations (uri),
  CONSTRAINT fk_templateCust_templateId FOREIGN KEY (templateId) REFERENCES templates (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom sections that are added to a published template
CREATE TABLE IF NOT EXISTS `customSections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `pinnedSectionId` INT NOT NULL,     # Pointer to the section being customized
  `migrationStatus` VARCHAR(8) NOT NULL DEFAULT 'OK',    # OK, STALE, ORPHANED

  `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customSecs_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_customSecs_currentId FOREIGN KEY (pinnedSectionId) REFERENCES sections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom questions that are added to a published template
CREATE TABLE IF NOT EXISTS `customQuestions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `migrationStatus` VARCHAR(8) NOT NULL DEFAULT 'OK',    # OK, STALE, ORPHANED

  # Questions can be attached to a customSection. If so, these columns are applicable:
  `customSectionId` INT UNSIGNED NULL,
  `displayOrder` INT NULL,

  # Questions can be attached to a question that is part of the published Template
  # If so, this column is applicable:
  `pinnedQuestionId` INT NULL,    # Pointer to the question being customized

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
  CONSTRAINT fk_customQs_currentId FOREIGN KEY (pinnedQuestionId) REFERENCES questions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance and requirements for a section in a published template
CREATE TABLE IF NOT EXISTS `sectionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `sectionId` INT NOT NULL,    # Pointer to the section being customized
  `migrationStatus` VARCHAR(8) NOT NULL DEFAULT 'OK',    # OK, STALE, ORPHANED

  `requirements` TEXT NULL,
  `guidance` TEXT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_sectionCusts UNIQUE (`templateCustomizationId`, `sectionId`),
  CONSTRAINT fk_sectionCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_sectionCust_sectionId FOREIGN KEY (sectionId) REFERENCES sections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance, requirements and sample text for a section in a published template
CREATE TABLE IF NOT EXISTS `questionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `questionId` INT NOT NULL,
  `migrationStatus` VARCHAR(8) NOT NULL DEFAULT 'OK',    # OK, STALE, ORPHANED

  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_questionCusts UNIQUE (`templateCustomizationId`, `questionId`),
  CONSTRAINT fk_qCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_qCust_questionId FOREIGN KEY (questionId) REFERENCES questions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;


# Published version tables
# ---------------------------------------------

# Table to store associations between a versionedTemplate and an organizations customizations
CREATE TABLE IF NOT EXISTS `versionedTemplateCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `currentVersionedTemplateId` INT NOT NULL,  # Pointer to the template being customized
  `priorVersionedTemplateId` INT NULL,        # Pointer to the prior version of the template being customized
  `status` VARCHAR(8) NOT NULL DEFAULT 'DRAFT', # DRAFT, PUBLISHED, ARCHIVED
  `active` TINYINT(1) NOT NULL DEFAULT 1,

  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vTemplateCusts UNIQUE (`affiliationId`, `templateCustomizationId`),
  CONSTRAINT fk_vTemplateCust_affiliationId FOREIGN KEY (affiliationId) REFERENCES affiliations (uri),
  CONSTRAINT fk_vTemplateCust_templateId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_vTemplateCust_currentId FOREIGN KEY (currentVersionedTemplateId) REFERENCES versionedTemplates (id),
  CONSTRAINT fk_vTemplateCust_priorId FOREIGN KEY (priorVersionedTemplateId) REFERENCES versionedTemplates (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom sections that are added to a published template
CREATE TABLE IF NOT EXISTS `versionedCustomSections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `customSectionId` INT UNSIGNED NOT NULL,
  `currentPinnedVersionedSectionId` INT NOT NULL,  # Pointer to the section this customSection follows
  `priorPinnedVersionedSectionId` INT NULL,        # Pointer to the prior version of the section this customSection followed

  `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vCustomSecs_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_vCustomSecs_sectionId FOREIGN KEY (customSectionId) REFERENCES customSections (id),
  CONSTRAINT fk_vCustomSecs_currentId FOREIGN KEY (currentPinnedVersionedSectionId) REFERENCES versionedSections (id),
  CONSTRAINT fk_vCustomSecs_priorId FOREIGN KEY (priorPinnedVersionedSectionId) REFERENCES versionedSections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom questions that are added to a published template
CREATE TABLE IF NOT EXISTS `versionedCustomQuestions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `customQuestionId` INT UNSIGNED NOT NULL,

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
  CONSTRAINT fk_vCustomQs_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_vCustomQs_questionId FOREIGN KEY (customQuestionId) REFERENCES customQuestions (id),
  CONSTRAINT fk_vCustomQs_sectionId FOREIGN KEY (customSectionId) REFERENCES customSections (id),
  CONSTRAINT fk_vCustomQs_currentId FOREIGN KEY (currentPinnedVersionedQuestionId) REFERENCES versionedQuestions (id),
  CONSTRAINT fk_vCustomQs_priorId FOREIGN KEY (priorPinnedVersionedQuestionId) REFERENCES versionedQuestions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance and requirements for a section in a published template
CREATE TABLE IF NOT EXISTS `versionedSectionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `sectionCustomizationId` INT UNSIGNED NOT NULL,
  `currentVersionedSectionId` INT NOT NULL,  # Pointer to the section being customized
  `priorVersionedSectionId` INT NULL,        # Pointer to the prior version of the section being customized

  `requirements` TEXT NULL,
  `guidance` TEXT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vSectionCusts UNIQUE (`templateCustomizationId`, `sectionCustomizationId`),
  CONSTRAINT fk_vSectionCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_vSectionCust_sectionId FOREIGN KEY (sectionCustomizationId) REFERENCES sectionCustomizations (id),
  CONSTRAINT fk_vSectionCust_currentId FOREIGN KEY (currentVersionedSectionId) REFERENCES versionedSections (id),
  CONSTRAINT fk_vSectionCust_priorId FOREIGN KEY (priorVersionedSectionId) REFERENCES versionedSections (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

# Table to store custom guidance, requirements and sample text for a section in a published template
CREATE TABLE IF NOT EXISTS `versionedQuestionCustomizations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `templateCustomizationId` INT UNSIGNED NOT NULL,
  `questionCustomizationId` INT UNSIGNED NOT NULL,
  `currentVersionedQuestionId` INT NOT NULL,    # Pointer to the question being customized
  `priorVersionedQuestionId` INT NULL,          # Pointer to the prior version of the question being customized

  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vQuestionCusts UNIQUE (`templateCustomizationId`, `questionCustomizationId`),
  CONSTRAINT fk_vQCust_templateCustId FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations (id),
  CONSTRAINT fk_vQCust_questionId FOREIGN KEY (questionCustomizationId) REFERENCES questionCustomizations (id),
  CONSTRAINT fk_vQCust_currentId FOREIGN KEY (currentVersionedQuestionId) REFERENCES versionedQuestions (id),
  CONSTRAINT fk_vQCust_priorId FOREIGN KEY (priorVersionedQuestionId) REFERENCES versionedQuestions (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;
