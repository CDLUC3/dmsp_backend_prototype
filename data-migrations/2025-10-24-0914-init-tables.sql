CREATE TABLE IF NOT EXISTS `affiliationDepartments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `abbreviation` VARCHAR(255),
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_affiliationDepts UNIQUE (`affiliationId`, `name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `affiliationEmailDomains` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliationId` int NOT NULL,
  `emailDomain` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_emailDomain` (`emailDomain`)
) ENGINE=InnoDB AUTO_INCREMENT=2777 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `affiliationLinks` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliationId` int NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_affiliation_link (`affiliationId`, `url`)
) ENGINE=InnoDB AUTO_INCREMENT=2457 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `affiliations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provenance` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DMPTOOL',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `searchName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `funder` tinyint(1) NOT NULL DEFAULT '0',
  `fundrefId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `homepage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acronyms` json DEFAULT NULL,
  `aliases` json DEFAULT NULL,
  `types` json DEFAULT NULL,
  `logoURI` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ssoEntityId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feedbackEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `feedbackMessage` mediumtext COLLATE utf8mb4_unicode_ci,
  `feedbackEmails` json DEFAULT NULL,
  `managed` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `apiTarget` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_affiliation_uri` (`uri`),
  UNIQUE KEY `unique_affiliation_displayName` (`displayName`)
) ENGINE=InnoDB AUTO_INCREMENT=5495 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `answerComments` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `answerId` int UNSIGNED NOT NULL,
  `commentText` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `answers` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `planId` int UNSIGNED NOT NULL,
  `versionedSectionId` int UNSIGNED NOT NULL,
  `versionedQuestionId` int UNSIGNED NOT NULL,
  `json` json DEFAULT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_plan_answer (`planId`, `versionedSectionId`, `versionedQuestionId`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customQuestions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `migrationStatus` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OK',
  `customSectionId` int unsigned DEFAULT NULL,
  `displayOrder` int DEFAULT NULL,
  `pinnedQuestionId` int UNSIGNED DEFAULT NULL,
  `questionText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirementText` text COLLATE utf8mb4_unicode_ci,
  `guidanceText` text COLLATE utf8mb4_unicode_ci,
  `sampleText` text COLLATE utf8mb4_unicode_ci,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customSections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `pinnedSectionId` int UNSIGNED NOT NULL,
  `migrationStatus` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OK',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `introduction` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `guidance` text COLLATE utf8mb4_unicode_ci,
  `displayOrder` int NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dataMigrations` (
  `migrationFile` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_migration_file` (`migrationFile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `planId` int UNSIGNED NOT NULL,
  `requestedById` int UNSIGNED NOT NULL,
  `requested` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedById` int UNSIGNED DEFAULT NULL,
  `completed` timestamp NULL DEFAULT NULL,
  `summaryText` mediumtext COLLATE utf8mb4_unicode_ci,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedbackComments` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `feedbackId` int UNSIGNED NOT NULL,
  `answerId` int UNSIGNED NOT NULL,
  `commentText` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `licenses` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `recommended` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_license_name` (`name`),
  UNIQUE KEY `unique_license_uri` (`uri`)
) ENGINE=InnoDB AUTO_INCREMENT=681 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `memberRoles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `displayOrder` int NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member_role_uri` (`uri`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `metadataStandardResearchDomains` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `metadataStandardId` int UNSIGNED NOT NULL,
  `researchDomainId` int UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_mstandard_research_domain (`metadataStandardId`, `researchDomainId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `metadataStandards` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `keywords` json DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mstandard_name` (`name`),
  UNIQUE KEY `unique_mstandard_uri` (`uri`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXSISTS `planFundings` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `planId` int UNSIGNED NOT NULL,
  `projectFundingId` int UNSIGNED NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_plan_funding (`planId`, `projectFundingId`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `planMemberRoles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `planMemberId` int UNSIGNED NOT NULL,
  `memberRoleId` int UNSIGNED NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_plan_member_role (`planMemberId`, `memberRoleId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `planMembers` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `planId` int UNSIGNED NOT NULL,
  `projectMemberId` int UNSIGNED NOT NULL,
  `isPrimaryContact` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_plan_member (`planId`, `projectMemberId`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `plans` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectId` int UNSIGNED NOT NULL,
  `versionedTemplateId` int UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dmpId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registeredById` int UNSIGNED DEFAULT NULL,
  `registered` timestamp NULL DEFAULT NULL,
  `languageId` char(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en-US',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projectCollaborators` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectId` int UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitedById` int UNSIGNED NOT NULL,
  `userId` int UNSIGNED DEFAULT NULL,
  `accessLevel` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMMENT',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_template_collaborator` (`projectId`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projectFundings` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectId` int UNSIGNED NOT NULL,
  `affiliationId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `funderProjectNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grantId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `funderOpportunityNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projectMemberRoles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectMemberId` int UNSIGNED NOT NULL,
  `memberRoleId` int UNSIGNED NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_project_member_role (`projectMemberId`, `memberRoleId`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projectMembers` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectId` int UNSIGNED NOT NULL,
  `affiliationId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `givenName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orcid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isPrimaryContact` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abstractText` mediumtext COLLATE utf8mb4_unicode_ci,
  `researchDomainId` INT UNSIGNED DEFAULT NULL,
  `startDate` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endDate` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isTestProject` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `questionConditions` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `questionId` int UNSIGNED NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SHOW_QUESTION',
  `conditionType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EQUAL',
  `conditionMatch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `questionCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `questionId` int UNSIGNED NOT NULL,
  `migrationStatus` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OK',
  `requirementText` text COLLATE utf8mb4_unicode_ci,
  `guidanceText` text COLLATE utf8mb4_unicode_ci,
  `sampleText` text COLLATE utf8mb4_unicode_ci,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_questionCusts` (`templateCustomizationId`,`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `questions` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int UNSIGNED NOT NULL,
  `sectionId` int UNSIGNED NOT NULL,
  `sourceQuestionId` int UNSIGNED DEFAULT NULL,
  `displayOrder` int NOT NULL,
  `isDirty` tinyint(1) NOT NULL DEFAULT '1',
  `questionText` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `json` json DEFAULT NULL,
  `requirementText` mediumtext COLLATE utf8mb4_unicode_ci,
  `guidanceText` mediumtext COLLATE utf8mb4_unicode_ci,
  `sampleText` mediumtext COLLATE utf8mb4_unicode_ci,
  `useSampleTextAsDefault` tinyint(1) NOT NULL DEFAULT '0',
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=545 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `relatedWorks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `planId` int UNSIGNED NOT NULL,
  `workVersionId` int unsigned NOT NULL,
  `score` float NOT NULL,
  `status` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `doiMatch` json DEFAULT NULL,
  `contentMatch` json DEFAULT NULL,
  `authorMatches` json DEFAULT NULL,
  `institutionMatches` json DEFAULT NULL,
  `funderMatches` json DEFAULT NULL,
  `awardMatches` json DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED DEFAULT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED DEFAULT NULL,
  `scoreMax` float NOT NULL,
  `sourceType` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_planId_workVersionId` (`planId`,`workVersionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `repositories` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keywords` json DEFAULT NULL,
  `repositoryTypes` json DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_license_name` (`name`),
  UNIQUE KEY `unique_license_uri` (`uri`),
  UNIQUE KEY `unique_license_website` (`website`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `repositoryResearchDomains` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `repositoryId` int UNSIGNED NOT NULL,
  `researchDomainId` int UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
  CONSTRAINT unique_repository_research_domain (`repositoryId`, `researchDomainId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `researchDomains` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentResearchDomainId` int UNSIGNED DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_research_domain_name` (`name`),
  UNIQUE KEY `unique_research_domain_uri` (`uri`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sectionCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `sectionId` int UNSIGNED NOT NULL,
  `migrationStatus` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OK',
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `guidance` text COLLATE utf8mb4_unicode_ci,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sectionCusts` (`templateCustomizationId`,`sectionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sectionTags` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sectionId` int UNSIGNED NOT NULL,
  `tagId` int UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_section_tag (`sectionId`, `tagId`)
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int UNSIGNED NOT NULL,
  `sourceSectionId` int UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `introduction` mediumtext COLLATE utf8mb4_unicode_ci,
  `requirements` mediumtext COLLATE utf8mb4_unicode_ci,
  `guidance` mediumtext COLLATE utf8mb4_unicode_ci,
  `displayOrder` int NOT NULL,
  `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
  `isDirty` tinyint(1) NOT NULL DEFAULT '1',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=417 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(255),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_name` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `templateCollaborators` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitedById` int UNSIGNED NOT NULL,
  `userId` int UNSIGNED DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_template_collaborator` (`templateId`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `templateCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `affiliationId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateId` int UNSIGNED NOT NULL,
  `status` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `migrationStatus` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OK',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_templateCusts` (`affiliationId`,`templateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT unique_templateLinks UNIQUE (`templateId`, `url`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `templates` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sourceTemplateId` int UNSIGNED DEFAULT NULL,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `ownerId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latestPublishVisibility` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latestPublishVersion` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latestPublishDate` timestamp NULL DEFAULT NULL,
  `isDirty` tinyint(1) NOT NULL DEFAULT '1',
  `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
  `languageId` char(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en-US',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userDepartments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliationDepartmentId` INT UNSIGNED NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_userDepts UNIQUE (`affiliationDepartmentId`, `userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userEmails` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` int UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `isConfirmed` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_userEmails_userId_email` (`userId`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `oldPasswordHash` VARCHAR(255),
  `role` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RESEARCHER',
  `givenName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliationId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acceptedTerms` tinyint(1) NOT NULL DEFAULT '0',
  `orcid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ssoId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `languageId` char(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en-US',
  `last_sign_in` timestamp NULL DEFAULT NULL,
  `last_sign_in_via` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failed_sign_in_attempts` int NOT NULL DEFAULT '0',
  `notify_on_comment_added` tinyint(1) NOT NULL DEFAULT '1',
  `notify_on_template_shared` tinyint(1) NOT NULL DEFAULT '1',
  `notify_on_feedback_complete` tinyint(1) NOT NULL DEFAULT '1',
  `notify_on_plan_shared` tinyint(1) NOT NULL DEFAULT '1',
  `notify_on_plan_visibility_change` tinyint(1) NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED DEFAULT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_ssoId` (`ssoId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedCustomQuestions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `customQuestionId` int unsigned NOT NULL,
  `customSectionId` int unsigned DEFAULT NULL,
  `displayOrder` int DEFAULT NULL,
  `currentPinnedVersionedQuestionId` int UNSIGNED DEFAULT NULL,
  `priorPinnedVersionedQuestionId` int UNSIGNED DEFAULT NULL,
  `questionText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirementText` text COLLATE utf8mb4_unicode_ci,
  `guidanceText` text COLLATE utf8mb4_unicode_ci,
  `sampleText` text COLLATE utf8mb4_unicode_ci,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_vCustomQs UNIQUE (`templateCustomizationId`,`customSectionId`,`customQuestionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedCustomSections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `customSectionId` int unsigned NOT NULL,
  `currentPinnedVersionedSectionId` int UNSIGNED NOT NULL,
  `priorPinnedVersionedSectionId` int UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `introduction` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `guidance` text COLLATE utf8mb4_unicode_ci,
  `displayOrder` int NOT NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_vCustomSecs UNIQUE (`templateCustomizationId`,`customSectionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedQuestionConditions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `versionedQuestionId` int NOT NULL,
  `questionConditionId` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SHOW_QUESTION',
  `conditionType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EQUAL',
  `conditionMatch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedQuestionCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `questionCustomizationId` int unsigned NOT NULL,
  `currentVersionedQuestionId` int NOT NULL,
  `priorVersionedQuestionId` int DEFAULT NULL,
  `requirementText` text COLLATE utf8mb4_unicode_ci,
  `guidanceText` text COLLATE utf8mb4_unicode_ci,
  `sampleText` text COLLATE utf8mb4_unicode_ci,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vQuestionCusts` (`templateCustomizationId`,`questionCustomizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedQuestions` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `versionedTemplateId` int UNSIGNED NOT NULL,
  `versionedSectionId` int UNSIGNED NOT NULL,
  `questionId` int UNSIGNED NOT NULL,
  `questionText` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `json` json DEFAULT NULL,
  `requirementText` mediumtext COLLATE utf8mb4_unicode_ci,
  `guidanceText` mediumtext COLLATE utf8mb4_unicode_ci,
  `sampleText` mediumtext COLLATE utf8mb4_unicode_ci,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `displayOrder` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `useSampleTextAsDefault` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=542 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedSectionCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `templateCustomizationId` int unsigned NOT NULL,
  `sectionCustomizationId` int unsigned NOT NULL,
  `currentVersionedSectionId` int UNSIGNED NOT NULL,
  `priorVersionedSectionId` int UNSIGNED DEFAULT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `guidance` text COLLATE utf8mb4_unicode_ci,
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vSectionCusts` (`templateCustomizationId`,`sectionCustomizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedSectionTags` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `versionedSectionId` int UNSIGNED NOT NULL,
  `tagId` int UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_versionedSection_tag (`versionedSectionId`, `tagId`)
) ENGINE=InnoDB AUTO_INCREMENT=512 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedSections` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `versionedTemplateId` int UNSIGNED NOT NULL,
  `sectionId` int UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `introduction` mediumtext COLLATE utf8mb4_unicode_ci,
  `requirements` mediumtext COLLATE utf8mb4_unicode_ci,
  `guidance` mediumtext COLLATE utf8mb4_unicode_ci,
  `displayOrder` int NOT NULL,
  `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=511 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedTemplateCustomizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `affiliationId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateCustomizationId` int unsigned NOT NULL,
  `currentVersionedTemplateId` int UNSIGNED NOT NULL,
  `priorVersionedTemplateId` int UNSIGNED DEFAULT NULL,
  `status` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdById` INT UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vTemplateCusts` (`affiliationId`,`templateCustomizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT unique_vtemplateLinks UNIQUE (`versionedTemplateId`, `url`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `versionedTemplates` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `version` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `versionType` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `versionedById` int UNSIGNED NOT NULL,
  `comment` mediumtext COLLATE utf8mb4_unicode_ci,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `ownerId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visibility` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
  `languageId` char(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en-US',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `workVersions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `workId` int unsigned NOT NULL,
  `hash` binary(16) NOT NULL,
  `workType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publicationDate` date DEFAULT NULL,
  `title` text COLLATE utf8mb4_unicode_ci,
  `abstractText` mediumtext COLLATE utf8mb4_unicode_ci,
  `authors` json NOT NULL,
  `institutions` json NOT NULL,
  `funders` json NOT NULL,
  `awards` json NOT NULL,
  `publicationVenue` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED DEFAULT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hash` (`workId`,`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `works` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `doi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT UNSIGNED DEFAULT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedById` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doi` (`doi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Foreign key constraints
-- ---------------------------------------------------------------------------
ALTER TABLE affiliationDepartments
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri) ON DELETE CASCADE;

ALTER TABLE affiliationEmailDomains
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri) ON DELETE CASCADE;

ALTER TABLE affiliationLinks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri) ON DELETE CASCADE;

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

ALTER TABLE customQuestions
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (customSectionId) REFERENCES customSections(id);

ALTER TABLE customSections
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (pinnedSectionId) REFERENCES sections(id);

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

ALTER TABLE memberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE planFundings
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (projectFundingId) REFERENCES projectFundings(id);

ALTER TABLE planMemberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planMemberId) REFERENCES planMembers(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (memberRoleId) REFERENCES memberRoles(id) ON DELETE CASCADE;

ALTER TABLE planMembers
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (projectMemberId) REFERENCES projectMembers(id) ON DELETE CASCADE;

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

ALTER TABLE projectFundings
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);

ALTER TABLE projectMemberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectMemberId) REFERENCES projectMembers(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (memberRoleId) REFERENCES memberRoles(id) ON DELETE CASCADE;

ALTER TABLE projectMembers
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);

ALTER TABLE questionConditions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE questionCustomizations
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionId) REFERENCES questions(id);

ALTER TABLE questions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (questionTypeId) REFERENCES questionTypes(id);

ALTER TABLE relatedWorks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE
  ADD FOREIGN KEY (workVersionId) REFERENCES workVersions(id) ON DELETE CASCADE;

ALTER TABLE repositories
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE repositoryResearchDomains
  ADD FOREIGN KEY (repositoryId) REFERENCES repositories(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (researchDomainId) REFERENCES researchDomains(id) ON DELETE CASCADE;

ALTER TABLE researchDomains
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE sectionCustomizations
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id);

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

ALTER TABLE templateLinks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE;

ALTER TABLE templates
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (sourceTemplateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (ownerId) REFERENCES affiliations(uri) ON DELETE CASCADE;

ALTER TABLE userDepartments
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationDepartmentId) REFERENCES affiliationDepartments(id) ON DELETE CASCADE;

ALTER TABLE userEmails
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE users
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);

ALTER TABLE versionedCustomQuestions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (customSectionId) REFERENCES customSections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (customQuestionId) REFERENCES customQuestions(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (currentPinnedVersionedQuestionId) REFERENCES versionedQuestions(id),
  ADD FOREIGN KEY (priorPinnedVersionedQuestionId) REFERENCES versionedQuestions(id);

ALTER TABLE versionedCustomSections
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (customSectionId) REFERENCES customSections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (currentPinnedVersionedSectionId) REFERENCES versionedSections(id),
  ADD FOREIGN KEY (priorPinnedVersionedSectionId) REFERENCES versionedSections(id);

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

ALTER TABLE versionedSectionCustomizations
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (sectionCustomizationId) REFERENCES sectionCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (currentVersionedSectionId) REFERENCES versionedSections(id),
  ADD FOREIGN KEY (priorVersionedSectionId) REFERENCES versionedSections(id);

ALTER TABLE versionedSectionTags
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE;

ALTER TABLE versionedSections
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE;

ALTER TABLE versionedTemplateCustomizations
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateCustomizationId) REFERENCES templateCustomizations(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (currentVersionedTemplateId) REFERENCES versionedTemplates(id),
  ADD FOREIGN KEY (priorVersionedTemplateId) REFERENCES versionedTemplates(id);

ALTER TABLE versionedTemplateLinks
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE;

ALTER TABLE versionedTemplates
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (versionedById) REFERENCES users(id);

ALTER TABLE workVersions
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (workId) REFERENCES works(id) ON DELETE CASCADE;

ALTER TABLE works
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);
