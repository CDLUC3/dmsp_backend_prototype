# Research Projects
CREATE TABLE `projects` (
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who contribute to a research project (e.g. principal investigators, data curators, etc.)
CREATE TABLE `projectContributors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `affiliationId` VARCHAR(255),
  `userId` INT NOT NULL,
  `givenName` VARCHAR(255),
  `surName` VARCHAR(255),
  `orcid` VARCHAR(255),
  `email` VARCHAR(255),
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliationId) REFERENCES affiliations(uri)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# The roles played by people who contribute to a research project
CREATE TABLE `projectContributorRoles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectContributorId` INT NOT NULL,
  `contributorRoleId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectContributorId) REFERENCES projectContributors(id) ON DELETE CASCADE,
  FOREIGN KEY (contributorRoleId) REFERENCES contributorRoles(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who have access to collaborate on writing the Project
CREATE TABLE `projectCollaborators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_project_collaborator UNIQUE (`projectId`, `email`),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (invitedById) REFERENCES users(id),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX planCollaborators_email_idx (`email`),
  INDEX planCollaborators_user_idx (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Institutions/organizations that provide financial support for a research project
CREATE TABLE `projectFunders` (
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
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliationId) REFERENCES affiliations(uri)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
