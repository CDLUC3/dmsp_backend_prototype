# User email addresses
CREATE TABLE `userEmails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `isPrimary` BOOLEAN NOT NULL DEFAULT false,
  `isConfirmed` BOOLEAN NOT NULL DEFAULT false,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_userEmails_userId_email UNIQUE (`userId`, `email`),
  INDEX userEmails_email_idx (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
