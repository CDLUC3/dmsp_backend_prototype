CREATE TABLE `contributorRoles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `description` text,
  `displayOrder` int NOT NULL,
  `created` timestamp DEFAULT CURRENT_TIMESTAMP,
  `modified` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_contributor_role_url UNIQUE (`url`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
