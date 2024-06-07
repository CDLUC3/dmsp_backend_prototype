CREATE TABLE `oauthTokens` (
  `token` varchar(255) PRIMARY KEY,
  `expiresAt` DateTime,
  `refreshToken` varchar(255),
  `refreshTokenExpiresAt` DateTime,
  `scope` varchar(255),
  `clientId` varchar(255) NOT NULL,
  `userId` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
