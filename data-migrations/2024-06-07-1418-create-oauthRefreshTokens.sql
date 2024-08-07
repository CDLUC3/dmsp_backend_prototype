CREATE TABLE `oauthRefreshTokens` (
  `token` varchar(255) PRIMARY KEY,
  `expiresAt` DateTime NOT NULL,
  `clientId` varchar(255) NOT NULL,
  `userId` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
