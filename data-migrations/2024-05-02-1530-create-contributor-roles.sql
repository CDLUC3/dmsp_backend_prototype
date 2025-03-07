CREATE TABLE `contributorRoles` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `label` varchar(255) NOT NULL,
  `uri` varchar(255) NOT NULL,
  `description` text,
  `displayOrder` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  CONSTRAINT unique_contributor_role_uri UNIQUE (`uri`),
  CONSTRAINT unique_contributor_role_order UNIQUE (`displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
