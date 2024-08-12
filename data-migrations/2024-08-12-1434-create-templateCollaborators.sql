CREATE TABLE `templateCollaborators` (
  `templateId` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `invitedById` INT NOT NULL,
  `userId` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`templateId`, `email`),
  FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (invitedById) REFERENCES users(id),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX templateCollaborators_email_idx (`email`),
  INDEX templateCollaborators_user_idx (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
