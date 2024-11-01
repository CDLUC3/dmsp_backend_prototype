CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` VARCHAR(16) NOT NULL DEFAULT 'RESEARCHER',
  `givenName` VARCHAR(255) NOT NULL,
  `surName` VARCHAR(255) NOT NULL,
  `affiliationId` VARCHAR(255) NOT NULL,
  `acceptedTerms` TINYINT(1) NOT NULL DEFAULT 0,
  `orcid` VARCHAR(255),
  `ssoId` VARCHAR(255),
  `locked` TINYINT(1) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,

  `last_sign_in` TIMESTAMP,
  `last_sign_in_via` VARCHAR(10),
  `failed_sign_in_attemps` INT NOT NULL DEFAULT 0,

  `notify_on_comment_added` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_template_shared` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_feedback_complete` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_plan_shared` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_plan_visibility_change` TINYINT(1) NOT NULL DEFAULT 1,

  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  CONSTRAINT unique_email UNIQUE (`email`),
  INDEX users_surName_idx (`surName`),
  INDEX users_affiliation_idx (`affiliationId`),
  INDEX users_role_idx (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;