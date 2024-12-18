# Data Management Plans (DMPs)
CREATE TABLE `plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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
  FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id) ON DELETE CASCADE,
  INDEX plans_dmpid_idx (`dmpId`),
  INDEX plans_modified_idx (`id`, `modified`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who contribute to a research project and should be associated with a specific Plan
CREATE TABLE `planContributors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `projectContributorId` INT NOT NULL,
  `roles` JSON NOT NULL DEFAULT '[]',
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (projectContributorId) REFERENCES projectContributors(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# People who have access to collaborate on writing the Plan
CREATE TABLE `planCollaborators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_template_collaborator UNIQUE (`planId`, `email`),
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (invitedById) REFERENCES users(id),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX planCollaborators_email_idx (`email`),
  INDEX planCollaborators_user_idx (`userId`)
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
