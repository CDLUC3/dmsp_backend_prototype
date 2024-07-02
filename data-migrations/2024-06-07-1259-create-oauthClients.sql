CREATE TABLE `oauthClients` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `redirectUris` text NOT NULL,
  `grants` varchar(255) NOT NULL,
  `clientId` varchar(255) NOT NULL,
  `clientSecret` varchar(255) NOT NULL,
  `userId` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_contributor_name UNIQUE (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
