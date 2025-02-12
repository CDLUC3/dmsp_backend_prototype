# Join table used to store the link between a Project in the MySQL DB and a DMP stored elsewhere (e.g. DynamoDB)
# It also stores high level metadata that is used to quickly display Plan info in the UI
CREATE TABLE `projectPlans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `versionedTemplateId` INT NOT NULL,
  `dmpId` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `funder` VARCHAR(255),
  `contributors` JSON,
  `lastUpdatedById` INT NOT NULL,
  `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registeredById` INT,
  `registered` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `visibility` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `languageId` CHAR(5) NOT NULL DEFAULT 'en-US',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (versionedTemplateId) REFERENCES versionedTemplates(id),
  FOREIGN KEY (lastUpdatedById) REFERENCES users(id),
  CONSTRAINT unique_dmp_id_idx UNIQUE (`dmpId`),
  INDEX projectPlans_projectId_dmpId_idx (`projectId`, `dmpId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
