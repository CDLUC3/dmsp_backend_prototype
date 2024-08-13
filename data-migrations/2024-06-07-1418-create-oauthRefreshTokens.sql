CREATE TABLE `oauthRefreshTokens` (
  `token` varchar(255) PRIMARY KEY,
  `expiresAt` DateTime NOT NULL,
  `clientId` varchar(255) NOT NULL,
  `userId` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
