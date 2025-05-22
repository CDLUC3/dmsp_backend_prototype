
CREATE TABLE IF NOT EXISTS `memberRoles` (
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
  CONSTRAINT unique_member_role_uri UNIQUE (`uri`),
  CONSTRAINT unique_member_role_order UNIQUE (`displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `planMemberRoles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planMemberId` INT NOT NULL,
  `memberRoleId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `planMembers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `projectMemberId` INT NOT NULL,
  `isPrimaryContact` TINYINT(1) NOT NULL DEFAULT 0,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `projectMemberRoles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectMemberId` INT NOT NULL,
  `memberRoleId` INT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `projectMembers` (
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

ALTER TABLE memberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id);

ALTER TABLE planMemberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planMemberId) REFERENCES planMembers(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (memberRoleId) REFERENCES memberRoles(id) ON DELETE CASCADE;

ALTER TABLE planMembers
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (projectMemberId) REFERENCES projectMembers(id);

ALTER TABLE projectMemberRoles
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectMemberId) REFERENCES projectMembers(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (memberRoleId) REFERENCES memberRoles(id) ON DELETE CASCADE;

ALTER TABLE projectMembers
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (affiliationId) REFERENCES affiliations(uri);
