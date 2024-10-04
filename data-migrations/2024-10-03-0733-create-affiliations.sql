CREATE TABLE `affiliations` (
  `id` VARCHAR(255) PRIMARY KEY,
  `provenance` VARCHAR(255) NOT NULL DEFAULT 'DMPTOOL',
  `name` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(255) NOT NULL,
  `searchName` VARCHAR(255),
  `funder` BOOLEAN NOT NULL DEFAULT 0,
  `fundrefId` VARCHAR(255),
  `homepage` VARCHAR(255),
  `acronyms` JSON DEFAULT NULL,
  `aliases` JSON DEFAULT NULL,
  `types` JSON DEFAULT '["Education"]',
  `logoURI` VARCHAR(255),
  `logoName` VARCHAR(255),
  `contactName` VARCHAR(255),
  `contactEmail` VARCHAR(255),
  `ssoEntityId` VARCHAR(255),
  `feedbackEnabled` BOOLEAN NOT NULL DEFAULT 0,
  `feedbackMessage` TEXT,
  `feedbackEmails` JSON DEFAULT NULL,
  `managed` BOOLEAN NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_displayName UNIQUE (`displayName`),
  FOREIGN KEY (createdById) REFERENCES users(id),
  FOREIGN KEY (modifiedById) REFERENCES users(id),
  INDEX affiliations_search_idx (`searchName`),
  INDEX affiliations_sso_idx (`ssoEntityId`),
  INDEX affiliations_funders_idx (`funder`),
  INDEX affiliations_provenance_idx (`provenance`, `id`, `displayName`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Add a unique constraint to the following fields, this approach allows the column to contain NULL
ALTER TABLE `affiliations`
  ADD UNIQUE KEY unique_affiliation_fundrefId (`fundrefId`);

# The email domains associated with an affiliation to assist with SSO
CREATE TABLE `affiliations_email_domains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `emailDomain` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_emailDomain UNIQUE (`emailDomain`),
  INDEX affiliations_email_domains_idx (`emailDomain`, `affiliationId`),
  FOREIGN KEY (affiliationId) REFERENCES affiliations(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# The URLs defined by the affiliation admins that are displayed on the sites sub header
CREATE TABLE `affiliations_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `affiliationId` VARCHAR(255) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `text` VARCHAR(255) NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliationId) REFERENCES affiliations(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
