# Setup sample BestPractice template
# ------------------------------------------
INSERT INTO `templates` (`name`, `affiliationId`, `ownerId`, `visibility`, `currentVersion`, `isDirty`, `bestPractice`, `created`, `modified`)
(SELECT 'DMPTool Default Template', 'https://ror.org/00dmfq477', `users`.`id`, 'Public', 'v2', 1, 1, '2023-11-01T01:02:03', '2024-07-21T11:12:13' FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 1, 'v2', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'super@example.com'), 'Added some additional requirements to Preservation section!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-07-09T21:22:20', '2024-07-09T21:22:20' FROM `templates` WHERE `templates`.`name` = 'DMPTool Default Template' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v1', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'super@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-06-15T18:19:20', '2024-07-09T21:22:23' FROM `templates` WHERE `templates`.`name` = 'DMPTool Default Template' LIMIT 1);

# Setup sample Funder templates
# ------------------------------------------
INSERT INTO `templates` (`name`, `affiliationId`, `ownerId`, `visibility`, `currentVersion`, `isDirty`, `bestPractice`, `created`, `modified`)
(SELECT 'NIH-Default DMSP', 'https://ror.org/01cwqze88', `users`.`id`, 'Public', 'v2', 0, 0, '2023-12-01T01:02:03', '2024-05-17T06:07:08' FROM `users` WHERE `email` = 'funder.admin@example.com');

INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 1, 'v2', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'Added a new section about budgets', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-05-17T06:07:05', '2024-05-17T06:07:05' FROM `templates` WHERE `templates`.`name` = 'NIH-Default DMSP' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v1', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-05-01T06:07:08', '2024-05-17T06:07:08' FROM `templates` WHERE `templates`.`name` = 'NIH-Default DMSP' LIMIT 1);

INSERT INTO `templates` (`name`, `affiliationId`, `ownerId`, `visibility`, `currentVersion`, `isDirty`, `bestPractice`, `created`, `modified`)
(SELECT 'NIH-GDS: Genomic Data Sharing', 'https://ror.org/01cwqze88', `users`.`id`, 'Public', 'v3.1', 1, 0, '2024-01-01T01:02:03', '2024-08-12T13:14:15' FROM `users` WHERE `email` = 'funder.admin@example.com');

INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v3.1', 'Draft', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'Added some additional requirements to Preservation section!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-08-02T02:03:01', '2024-08-02T02:03:01' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 1, 'v3', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-04-01T02:03:00', '2024-08-02T03:04:05' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v2.2', 'Draft', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'Added some additional requirements to Preservation section!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-03-21T22:23:20', '2024-04-01T02:03:04' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v2.1', 'Draft', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'Added some additional requirements to Preservation section!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-03-19T19:20:18', '2024-03-21T22:23:24' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v2', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-02-18T16:17:15', '2024-03-19T19:20:21' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);
INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 0, 'v1', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'funder.admin@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, '2024-01-17T13:14:15', '2024-02-18T16:17:18' FROM `templates` WHERE `templates`.`name` = 'NIH-GDS: Genomic Data Sharing' LIMIT 1);

# Setup sample Organization template
# ------------------------------------------
INSERT INTO `templates` (`name`, `affiliationId`, `ownerId`, `visibility`, `currentVersion`, `isDirty`, `bestPractice`, `created`, `modified`)
(SELECT 'Göteborgs universitets mall', 'https://ror.org/01tm6cn81', `users`.`id`, 'Public', 'v1', 0, 0, '2024-08-01T01:02:03', '2024-08-11T15:16:17' FROM `users` WHERE `email` = 'orgB.admin@example.com');

INSERT INTO `templateCollaborators` (`templateId`, `email`, `userId`, `invitedById`)
(SELECT (SELECT `templates`.`id` FROM `templates` WHERE `templates`.`affiliationId` = 'https://ror.org/01tm6cn81' LIMIT 1), `users`.`email`, `users`.`id`, (SELECT `templates`.`ownerId` FROM `templates` WHERE `templates`.`affiliationId` = 'https://ror.org/01tm6cn81' LIMIT 1) FROM `users` WHERE `users`.`email` = 'orgA.admin@example.com');

INSERT INTO `versionedTemplates` (`templateId`, `active`, `version`, `versionType`, `versionedById`, `comment`, `name`, `affiliationId`, `ownerId`, `visibility`, `bestPractice`, `created`, `modified`)
(SELECT `templates`.`id`, 1, 'v1', 'Published', (SELECT `users`.`id` FROM `users` WHERE `users`.`email` = 'orgB.admin@example.com'), 'This is the initial version of our template!', `templates`.`name`, `templates`.`affiliationId`, `templates`.`ownerId`, `templates`.`visibility`, `templates`.`bestPractice`, `templates`.`modified`, `templates`.`modified` FROM `templates` WHERE `templates`.`name` = 'Göteborgs universitets mall' LIMIT 1);
