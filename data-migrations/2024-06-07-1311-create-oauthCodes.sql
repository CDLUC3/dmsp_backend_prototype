CREATE TABLE `oauthCodes` (
  `code` varchar(255) PRIMARY KEY,
  `redirectUri` varchar(255) NOT NULL,
  `scope` varchar(255) NOT NULL,
  `clientId` varchar(255) NOT NULL,
  `userId` INT NOT NULL,
  `codeChallenge` varchar(255),
  `codeChallengeMethod` varchar(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
