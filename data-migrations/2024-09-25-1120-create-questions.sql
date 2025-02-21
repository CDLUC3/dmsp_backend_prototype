CREATE TABLE `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `templateId` INT NOT NULL,
  `sectionId` INT NOT NULL,
  `sourceQuestionId` INT,
  `displayOrder` INT NOT NULL,
  `isDirty` TINYINT(1) NOT NULL DEFAULT 1,
  `questionTypeId` INT NOT NULL,
  `questionText` TEXT NOT NULL,
  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (createdById) REFERENCES users(id),
  FOREIGN KEY (modifiedById) REFERENCES users(id),
  INDEX questions_section_idx (`sectionId`, `displayOrder`),
  INDEX questions_isDirty_idx (`templateId`, `isDirty`),
  INDEX questions_template_idx (`templateId`, `displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `questionConditions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `questionId` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL DEFAULT 'SHOW_QUESTION',
  `conditionType` VARCHAR(255) NOT NULL DEFAULT 'EQUAL',
  `conditionMatch` VARCHAR(255),
  `target` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `versionedQuestions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `versionedTemplateId` INT NOT NULL,
  `versionedSectionId` INT NOT NULL,
  `questionId` INT NOT NULL,
  `questionTypeId` INT NOT NULL,
  `questionText` TEXT NOT NULL,
  `requirementText` TEXT,
  `guidanceText` TEXT,
  `sampleText` TEXT,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `displayOrder` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE,
  FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id) ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX versionedQuestions_template_idx (`versionedTemplateId`, `displayOrder`),
  INDEX versionedQuestions_section_idx (`versionedSectionId`, `displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `versionedQuestionConditions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `versionedQuestionId` INT NOT NULL,
  `questionConditionId` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL DEFAULT 'SHOW_QUESTION',
  `conditionType` VARCHAR(255) NOT NULL DEFAULT 'EQUAL',
  `conditionMatch` VARCHAR(255),
  `target` VARCHAR(255) NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (versionedQuestionId) REFERENCES versionedQuestions(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
