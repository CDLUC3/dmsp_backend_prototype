# Research Projects
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `abstractText` TEXT NOT NULL,
  `researchDomainUrl` VARCHAR(255),
  `startDate` VARCHAR(16),
  `endDate` VARCHAR(16),
  `isTestProject` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX projects_title (`id`, `title`),
  INDEX projects_modified (`id`, `modified`),
  INDEX projects_test (`id`, `isTestProject`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who contribute to a research project (e.g. principal investigators, data curators, etc.)
CREATE TABLE `projectContributors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `affiliationId` VARCHAR(255),
  `givenName` VARCHAR(255),
  `surName` VARCHAR(255),
  `orcid` VARCHAR(255),
  `email` VARCHAR(255),
  `roles` JSON NOT NULL DEFAULT '[]',
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliationId) REFERENCES affiliations(uri)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Institutions/organizations that provide financial support for a research project
CREATE TABLE `projectFunders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `funderId` VARCHAR(255) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `funderProjectNumber` VARCHAR(255),
  `grantId` VARCHAR(255),
  `funderOpportunityNumber` VARCHAR(255),
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (funderId) REFERENCES affiliations(uri)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
