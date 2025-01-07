# Licenses
CREATE TABLE `licenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_license_name UNIQUE (`name`),
  CONSTRAINT unique_license_uri UNIQUE (`uri`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Repositories
CREATE TABLE `repositories` (
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Research domains associated with a Repository
CREATE TABLE `repositoryResearchDomains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `repositoryId` INT NOT NULL,
  `researchDomainId` INT NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (repositoryId) REFERENCES repositories(id) ON DELETE CASCADE,
  FOREIGN KEY (researchDomainId) REFERENCES researchDomains(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Metadata Standards
CREATE TABLE `metadataStandards` (
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Research domains associated with a Metadata Standard
CREATE TABLE `metadataStandardResearchDomains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metadataStandardId` INT NOT NULL,
  `researchDomainId` INT NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  FOREIGN KEY (metadataStandardId) REFERENCES metadataStandards(id) ON DELETE CASCADE,
  FOREIGN KEY (researchDomainId) REFERENCES researchDomains(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
