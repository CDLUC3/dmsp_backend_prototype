# Project Output types
CREATE TABLE `outputTypes` (
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Institutions/organizations that provide financial support for a research project
CREATE TABLE `projectOutputs` (
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
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (outputTypeId) REFERENCES outputTypes(id),
  FOREIGN KEY (initialLicenseId) REFERENCES licenses(id),
  INDEX projectOutputs_type_idx (`projectId`, `outputTypeId`),
  INDEX projectOutputs_release_date_idx (`anticipatedReleaseDate`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Repositories associated ProjectOutputs
CREATE TABLE `projectOutputRepositories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectOutputId` INT NOT NULL,
  `repositoryId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectOutputId) REFERENCES projectOutputs(id) ON DELETE CASCADE,
  FOREIGN KEY (repositoryId) REFERENCES repositories(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Repositories associated MetadataStandards
CREATE TABLE `projectOutputMetadataStandards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectOutputId` INT NOT NULL,
  `metadataStandardId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectOutputId) REFERENCES projectOutputs(id) ON DELETE CASCADE,
  FOREIGN KEY (metadataStandardId) REFERENCES metadataStandards(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
