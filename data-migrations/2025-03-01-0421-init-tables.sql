# The email domains associated with an affiliation to assist with SSO
CREATE TABLE IF NOT EXISTS `affiliationEmailDomains` (
                                                       `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                       `affiliationId` INT NOT NULL,
                                                       `emailDomain` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_emailDomain UNIQUE (`emailDomain`),
  INDEX affiliations_email_domains_idx (`emailDomain`, `affiliationId`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

# The URLs defined by the affiliation admins that are displayed on the sites sub header
CREATE TABLE IF NOT EXISTS `affiliationLinks` (
                                                `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                `affiliationId` INT NOT NULL,
                                                `url` VARCHAR(255) NOT NULL,
  `text` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `affiliations` (
                                            `id` INT AUTO_INCREMENT PRIMARY KEY,
                                            `uri` VARCHAR(255) NOT NULL,
  `provenance` VARCHAR(255) NOT NULL DEFAULT 'DMPTOOL',
  `name` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(255) NOT NULL,
  `searchName` VARCHAR(255),
  `funder` BOOLEAN NOT NULL DEFAULT 0,
  `fundrefId` VARCHAR(255),
  `homepage` VARCHAR(255),
  `acronyms` JSON DEFAULT NULL,
  `aliases` JSON DEFAULT NULL,
  `types` JSON DEFAULT NULL,
  `logoURI` VARCHAR(255),
  `logoName` VARCHAR(255),
  `contactName` VARCHAR(255),
  `contactEmail` VARCHAR(255),
  `ssoEntityId` VARCHAR(255),
  `feedbackEnabled` BOOLEAN NOT NULL DEFAULT 0,
  `feedbackMessage` TEXT,
  `feedbackEmails` JSON DEFAULT NULL,
  `managed` BOOLEAN NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT 1,
  `apiTarget` VARCHAR(255) NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_affiliation_uri UNIQUE (`uri`),
  CONSTRAINT unique_affiliation_displayName UNIQUE (`displayName`),
  INDEX affiliations_uri_idx (`uri`),
  INDEX affiliations_search_idx (`searchName`),
  INDEX affiliations_sso_idx (`ssoEntityId`),
  INDEX affiliations_funders_idx (`funder`),
  INDEX affiliations_provenance_idx (`provenance`, `uri`, `displayName`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `answerComments` (
                                              `id` INT AUTO_INCREMENT PRIMARY KEY,
                                              `answerId` INT NOT NULL,
                                              `commentText` TEXT NOT NULL,
                                              `createdById` INT NOT NULL,
                                              `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              `modifiedById` INT NOT NULL,
                                              `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              INDEX answer_comments_modified_idx (`answerId`, `modified`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `answers` (
                                       `id` INT AUTO_INCREMENT PRIMARY KEY,
                                       `planId` INT NOT NULL,
                                       `versionedSectionId` INT NOT NULL,
                                       `versionedQuestionId` INT NOT NULL,
                                       `answerText` TEXT,
                                       `createdById` INT NOT NULL,
                                       `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       `modifiedById` INT NOT NULL,
                                       `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `contributorRoles` (
                                                `id` int AUTO_INCREMENT PRIMARY KEY,
                                                `label` varchar(255) NOT NULL,
  `uri` varchar(255) NOT NULL,
  `description` text,
  `displayOrder` int NOT NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_contributor_role_uri UNIQUE (`uri`),
  CONSTRAINT unique_contributor_role_order UNIQUE (`displayOrder`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feedbackComments` (
                                                `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                `feedbackId` INT NOT NULL,
                                                `answerId` INT NOT NULL,
                                                `commentText` TEXT NOT NULL,
                                                `createdById` INT NOT NULL,
                                                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                `modifiedById` INT NOT NULL,
                                                `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                INDEX feedback_comments_modified_idx (`answerId`, `modified`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feedback` (
                                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                                        `planId` INT NOT NULL,
                                        `requestedById` INT NOT NULL,
                                        `requested` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        `completedById` INT,
                                        `completed` TIMESTAMP,
                                        `summaryText` TEXT,
                                        `createdById` INT NOT NULL,
                                        `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        `modifiedById` INT NOT NULL,
                                        `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `licenses` (
                                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                                        `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `recommended` TINYINT(1) NOT NULL DEFAULT 0,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_license_name UNIQUE (`name`),
  CONSTRAINT unique_license_uri UNIQUE (`uri`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `metadataStandardResearchDomains` (
                                                               `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                               `metadataStandardId` INT NOT NULL,
                                                               `researchDomainId` INT NOT NULL,
                                                               `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                               `createdById` int NOT NULL,
                                                               `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                               `modifiedById` int NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `metadataStandards` (
                                                 `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                 `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `keywords` JSON,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_mstandard_name UNIQUE (`name`),
  CONSTRAINT unique_mstandard_uri UNIQUE (`uri`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `planContributorRoles` (
                                                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                    `planContributorId` INT NOT NULL,
                                                    `contributorRoleId` INT NOT NULL,
                                                    `createdById` INT NOT NULL,
                                                    `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                    `modifiedById` INT NOT NULL,
                                                    `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `planContributors` (
                                                `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                `planId` INT NOT NULL,
                                                `projectContributorId` INT NOT NULL,
                                                `isPrimaryContact` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `planFunders` (
                                           `id` INT AUTO_INCREMENT PRIMARY KEY,
                                           `planId` INT NOT NULL,
                                           `projectFunderId` INT NOT NULL,
                                           `createdById` INT NOT NULL,
                                           `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           `modifiedById` INT NOT NULL,
                                           `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `plans` (
                                     `id` INT AUTO_INCREMENT PRIMARY KEY,
                                     `projectId` INT NOT NULL,
                                     `versionedTemplateId` INT NOT NULL,
                                     `visibility` VARCHAR(16) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `dmpId` VARCHAR(255),
  `registeredById` INT,
  `registered` TIMESTAMP,
  `languageId` CHAR(5) NOT NULL DEFAULT 'en-US',
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX plans_dmpid_idx (`dmpId`),
  INDEX plans_modified_idx (`id`, `modified`),
  INDEX plans_status_idx (`status`),
  INDEX plans_featured_idx (`featured`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectCollaborators` (
                                                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                    `projectId` INT NOT NULL,
                                                    `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT,
  `accessLevel` VARCHAR(8) NOT NULL DEFAULT 'COMMENT',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_template_collaborator UNIQUE (`projectId`, `email`),
  INDEX projectCollaborators_email_idx (`email`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectContributorRoles` (
                                                       `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                       `projectContributorId` INT NOT NULL,
                                                       `contributorRoleId` INT NOT NULL,
                                                       `createdById` INT NOT NULL,
                                                       `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                       `modifiedById` INT NOT NULL,
                                                       `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectContributors` (
                                                   `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                   `projectId` INT NOT NULL,
                                                   `affiliationId` VARCHAR(255),
  `givenName` VARCHAR(255),
  `surName` VARCHAR(255),
  `orcid` VARCHAR(255),
  `email` VARCHAR(255),
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectFunders` (
                                              `id` INT AUTO_INCREMENT PRIMARY KEY,
                                              `projectId` INT NOT NULL,
                                              `affiliationId` VARCHAR(255) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `funderProjectNumber` VARCHAR(255),
  `grantId` VARCHAR(255),
  `funderOpportunityNumber` VARCHAR(255),
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectOutputMetadataStandards` (
                                                              `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                              `projectOutputId` INT NOT NULL,
                                                              `metadataStandardId` INT NOT NULL,
                                                              `createdById` INT NOT NULL,
                                                              `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                              `modifiedById` INT NOT NULL,
                                                              `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectOutputRepositories` (
                                                         `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                         `projectOutputId` INT NOT NULL,
                                                         `repositoryId` INT NOT NULL,
                                                         `createdById` INT NOT NULL,
                                                         `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                         `modifiedById` INT NOT NULL,
                                                         `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectOutputTypes` (
                                                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                  `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_license_name UNIQUE (`name`),
  CONSTRAINT unique_license_uri UNIQUE (`uri`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projectOutputs` (
                                              `id` INT AUTO_INCREMENT PRIMARY KEY,
                                              `projectId` INT NOT NULL,
                                              `outputTypeId` INT NOT NULL,
                                              `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `mayContainSensitiveInformation` TINYINT(1),
  `mayContainPII` TINYINT(1),
  `initialAccessLevel` VARCHAR(16),
  `initialLicenseId` INT,
  `anticipatedReleaseDate` VARCHAR(16),
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX projectOutputs_type_idx (`projectId`, `outputTypeId`),
  INDEX projectOutputs_release_date_idx (`anticipatedReleaseDate`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projects` (
                                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                                        `title` VARCHAR(255) NOT NULL,
  `abstractText` TEXT,
  `researchDomainId` VARCHAR(255),
  `startDate` VARCHAR(16),
  `endDate` VARCHAR(16),
  `isTestProject` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX projects_title_idx (`id`, `title`),
  INDEX projects_modified_idx (`id`, `modified`),
  INDEX projects_test_idx (`id`, `isTestProject`),
  INDEX projects_dates_idx (`id`, `startDate`, `endDate`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `questionConditions` (
                                                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                  `questionId` INT NOT NULL,
                                                  `action` VARCHAR(255) NOT NULL DEFAULT 'SHOW_QUESTION',
  `conditionType` VARCHAR(255) NOT NULL DEFAULT 'EQUAL',
  `conditionMatch` VARCHAR(255),
  `target` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `questionOptions` (
                                               `id` INT AUTO_INCREMENT PRIMARY KEY,
                                               `questionId` INT NOT NULL,
                                               `text` VARCHAR(255) NOT NULL,
  `orderNumber` INT NOT NULL,
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `questionTypes` (
                                             `id` INT AUTO_INCREMENT PRIMARY KEY,
                                             `name` varchar(255) NOT NULL,
  `usageDescription` text,
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  CONSTRAINT unique_name UNIQUE (`name`),
  INDEX questionTypes_name_idx (`name`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `questions` (
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
  `useSampleTextAsDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX questions_section_idx (`sectionId`, `displayOrder`),
  INDEX questions_isDirty_idx (`templateId`, `isDirty`),
  INDEX questions_template_idx (`templateId`, `displayOrder`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `relatedWorks` (
                                            `id` INT AUTO_INCREMENT PRIMARY KEY,
                                            `projectId` INT NOT NULL,
                                            `identifier` VARCHAR(255) NOT NULL,
  `relationDescriptor` VARCHAR(255) NOT NULL,
  `workType` VARCHAR(255) NOT NULL,
  `citation` TEXT,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `repositories` (
                                            `id` INT AUTO_INCREMENT PRIMARY KEY,
                                            `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `website` VARCHAR(255),
  `keywords` JSON,
  `repositoryTypes` JSON NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_license_name UNIQUE (`name`),
  CONSTRAINT unique_license_uri UNIQUE (`uri`),
  CONSTRAINT unique_license_website UNIQUE (`website`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `repositoryResearchDomains` (
                                                         `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                         `repositoryId` INT NOT NULL,
                                                         `researchDomainId` INT NOT NULL,
                                                         `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                         `createdById` int NOT NULL,
                                                         `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                         `modifiedById` int NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `researchDomains` (
                                               `id` INT AUTO_INCREMENT PRIMARY KEY,
                                               `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `parentResearchDomainId` INT,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_research_domain_name UNIQUE (`name`),
  CONSTRAINT unique_research_domain_uri UNIQUE (`uri`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sectionTags` (
                                           `id` INT AUTO_INCREMENT PRIMARY KEY,
                                           `sectionId` INT NOT NULL,
                                           `tagId` INT NOT NULL,
                                           `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           `createdById` int NOT NULL,
                                           `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           `modifiedById` int NOT NULL,
                                           INDEX sectionTags_idx(`sectionId`, `tagId`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sections` (
                                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                                        `templateId` INT NOT NULL,
                                        `sourceSectionId` INT,
                                        `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `bestPractice` TINYINT(1) NOT NULL DEFAULT 0,
  `isDirty` TINYINT(1) NOT NULL DEFAULT 1,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sections_name_idx (`name`),
  INDEX sections_isDirty_idx (`templateId`, `isDirty`),
  INDEX sections_template_idx (`templateId`, `displayOrder`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tags` (
                                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                                    `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX tags_name_idx (`name`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `templateCollaborators` (
                                                     `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                     `templateId` INT NOT NULL,
                                                     `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_template_collaborator UNIQUE (`templateId`, `email`),
  INDEX templateCollaborators_email_idx (`email`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `templates` (
                                         `id` INT AUTO_INCREMENT PRIMARY KEY,
                                         `sourceTemplateId` INT,
                                         `name` TEXT NOT NULL,
                                         `description` TEXT,
                                         `ownerId` VARCHAR(255) NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `latestPublishVersion` VARCHAR(16),
  `latestPublishDate` TIMESTAMP DEFAULT NULL,
  `isDirty` TINYINT(1) NOT NULL DEFAULT 1,
  `bestPractice` TINYINT(1) NOT NULL DEFAULT 0,
  `languageId` CHAR(5) NOT NULL DEFAULT 'en-US',
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX templates_bestPractice_idx (`bestPractice`),
  INDEX templates_owner_idx (`ownerId`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `versionedQuestionConditions` (
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
  `modifiedById` int NOT NULL
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `versionedQuestions` (
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
  INDEX versionedQuestions_template_idx (`versionedTemplateId`, `displayOrder`),
  INDEX versionedQuestions_section_idx (`versionedSectionId`, `displayOrder`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `versionedSections` (
                                                 `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                 `versionedTemplateId` INT NOT NULL,
                                                 `sectionId` INT NOT NULL,
                                                 `name` VARCHAR(255) NOT NULL,
  `introduction` TEXT,
  `requirements` TEXT,
  `guidance` TEXT,
  `displayOrder` INT NOT NULL,
  `bestPractice` TINYINT(1) NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  INDEX versionedSections_template_idx (`versionedTemplateId`, `displayOrder`),
  INDEX versionedSections_name_ids (`name`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `versionedTemplates` (
                                                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                                                  `templateId` INT NOT NULL,
                                                  `active` TINYINT(1) NOT NULL DEFAULT 0,
  `version` VARCHAR(16) NOT NULL,
  `versionType` VARCHAR(16) NOT NULL DEFAULT 'Draft',
  `versionedById` INT NOT NULL,
  `comment` TEXT,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `ownerId` VARCHAR(255) NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `bestPractice` TINYINT(1) NOT NULL DEFAULT 0,
  `languageId` CHAR(5) NOT NULL DEFAULT 'en-US',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  INDEX versionedTemplates_active_idx(`active`),
  INDEX versionedTemplates_owner_idx (`ownerId`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

# User email addresses
CREATE TABLE IF NOT EXISTS `userEmails` (
                                          `id` INT AUTO_INCREMENT PRIMARY KEY,
                                          `userId` INT NOT NULL,
                                          `email` VARCHAR(255) NOT NULL,
  `isPrimary` TINYINT(1) NOT NULL DEFAULT 0,
  `isConfirmed` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_userEmails_userId_email UNIQUE (`userId`, `email`),
  INDEX userEmails_email_idx (`email`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
                                     `id` INT AUTO_INCREMENT PRIMARY KEY,
                                     `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` VARCHAR(16) NOT NULL DEFAULT 'RESEARCHER',
  `givenName` VARCHAR(255) NOT NULL,
  `surName` VARCHAR(255) NOT NULL,
  `affiliationId` VARCHAR(255) NOT NULL,
  `acceptedTerms` TINYINT(1) NOT NULL DEFAULT 0,
  `orcid` VARCHAR(255),
  `ssoId` VARCHAR(255),
  `locked` TINYINT(1) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `languageId` CHAR(5) NOT NULL DEFAULT 'en-US',

  `last_sign_in` TIMESTAMP,
  `last_sign_in_via` VARCHAR(10),
  `failed_sign_in_attemps` INT NOT NULL DEFAULT 0,

  `notify_on_comment_added` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_template_shared` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_feedback_complete` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_plan_shared` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_plan_visibility_change` TINYINT(1) NOT NULL DEFAULT 1,

  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  CONSTRAINT unique_email UNIQUE (`email`),
  INDEX users_surName_idx (`surName`),
  INDEX users_affiliation_idx (`affiliationId`),
  INDEX users_role_idx (`role`)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

# Foreign key constraints
# ---------------------------------------------------------------------------
ALTER TABLE affiliationEmailDomains
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(id) ON DELETE CASCADE;

ALTER TABLE affiliationLinks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(id) ON DELETE CASCADE;

ALTER TABLE affiliations
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE answerComments
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (answerId) REFERENCES answers(id) ON DELETE CASCADE;

ALTER TABLE answers
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id),
  ADD FOREIGN KEY (versionedQuestionId) REFERENCES versionedQuestions(id);

ALTER TABLE contributorRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE feedbackComments
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (feedbackId) REFERENCES feedback(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (answerId) REFERENCES answers(id) ON DELETE CASCADE;

ALTER TABLE feedback
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (requestedById) REFERENCES users(id),
  ADD FOREIGN KEY (completedById) REFERENCES users(id);

ALTER TABLE licenses
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE metadataStandardResearchDomains
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (metadataStandardId) REFERENCES metadataStandards(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (researchDomainId) REFERENCES researchDomains(id) ON DELETE CASCADE;

ALTER TABLE metadataStandards
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE planContributorRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planContributorId) REFERENCES planContributors(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (contributorRoleId) REFERENCES contributorRoles(id) ON DELETE CASCADE;

ALTER TABLE planContributors
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (projectContributorId) REFERENCES projectContributors(id);

ALTER TABLE planFunders
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (projectFunderId) REFERENCES projectFunders(id);

ALTER TABLE plans
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id);

ALTER TABLE projectCollaborators
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (invitedById) REFERENCES users(id),
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE projectContributorRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectContributorId) REFERENCES projectContributors(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (contributorRoleId) REFERENCES contributorRoles(id) ON DELETE CASCADE;

ALTER TABLE projectContributors
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);

ALTER TABLE projectFunders
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);

ALTER TABLE projectOutputMetadataStandards
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectOutputId) REFERENCES projectOutputs(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (metadataStandardId) REFERENCES metadataStandards(id) ON DELETE CASCADE;

ALTER TABLE projectOutputRepositories
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectOutputId) REFERENCES projectOutputs(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (repositoryId) REFERENCES repositories(id) ON DELETE CASCADE;

ALTER TABLE projectOutputTypes
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE projectOutputs
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (initialLicenseId) REFERENCES licenses(id);

ALTER TABLE questionConditions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE questionOptions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE questionTypes
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE questions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionTypeId) REFERENCES questionTypes(id);

ALTER TABLE relatedWorks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE repositories
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE repositoryResearchDomains
  ADD FOREIGN KEY (repositoryId) REFERENCES repositories(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (researchDomainId) REFERENCES researchDomains(id) ON DELETE CASCADE;

ALTER TABLE researchDomains
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE sectionTags
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE;

ALTER TABLE sections
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (sourceSectionId) REFERENCES sections(id);

ALTER TABLE tags
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE templateCollaborators
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (invitedById) REFERENCES users(id),
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE templates
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (sourceTemplateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (ownerId) REFERENCES affiliations(uri) ON DELETE CASCADE;

ALTER TABLE versionedQuestionConditions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (versionedQuestionId) REFERENCES versionedQuestions(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionConditionId) REFERENCES questionConditions(id) ON DELETE CASCADE;

ALTER TABLE versionedQuestions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionTypeId) REFERENCES questions(id);

ALTER TABLE versionedSections
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE;

ALTER TABLE versionedTemplates
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedById) REFERENCES users(id);

ALTER TABLE userEmails
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE users
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);
