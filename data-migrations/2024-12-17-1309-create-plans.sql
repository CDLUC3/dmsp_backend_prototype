# Data Management Plans (DMPs)
CREATE TABLE `plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `versionedTemplateId` INT NOT NULL,
  `visibility` VARCHAR(16) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `dmpId` VARCHAR(255),
  `lastUpdatedOn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdatedBy` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id),
  INDEX plans_dmpid_idx (`dmpId`),
  INDEX plans_modified_idx (`id`, `modified`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who contribute to a research project and should be associated with a specific Plan
CREATE TABLE `planContributors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `projectContributorId` INT NOT NULL,
  `roles` JSON NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (projectContributorId) REFERENCES projectContributors(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# The roles played by people who contribute to a research project
CREATE TABLE `planContributorRoles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planContributorId` INT NOT NULL,
  `contributorRoleId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planContributorId) REFERENCES planContributors(id) ON DELETE CASCADE,
  FOREIGN KEY (contributorRoleId) REFERENCES contributorRoles(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Institutions/organizations that provide financial support for the work associated with a Plan
CREATE TABLE `planFunders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `projectFunderId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (projectFunderId) REFERENCES projectFunders(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
