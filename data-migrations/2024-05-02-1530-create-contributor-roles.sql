CREATE TABLE `contributor_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp DEFAULT CURRENT_TIMESTAMP,
  `modified` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `index_contributor_roles_on_url` (`url`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
