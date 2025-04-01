CREATE TABLE `projectCollaborators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT NOT NULL,
  `accessLevel` VARCHAR(8) NOT NULL DEFAULT 'COMMENT',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  CONSTRAINT unique_project_collaborator UNIQUE (`projectId`, `email`),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (invitedById) REFERENCES users(id),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX projectCollaborators_email_idx (`email`),
  INDEX projectCollaborators_user_idx (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;