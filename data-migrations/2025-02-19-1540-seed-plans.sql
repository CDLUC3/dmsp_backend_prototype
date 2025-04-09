
INSERT INTO `plans` (`projectId`, `versionedTemplateId`, `visibility`, `status`, `dmpId`, `registeredById`,
`registered`, `languageId`, `featured`, `lastSynced`, `createdById`, `created`, `modifiedById`, `modified`)
VALUES
  (1, 2, 'PUBLIC', 'PUBLISHED', 'https://doi.org/10.11111/2A3B4C', 5, NOW(), 'en-US', 0, NOW(), 5, NOW(), 5, NOW()),
  (2, 5, 'PRIVATE', 'DRAFT', 'https://doi.org/10.11111/999999999', NULL, NULL, 'en-US', 0, NOW(), 5, NOW(), 5, NOW()),
  (3, 22, 'PRIVATE', 'PUBLISHED', 'https://doi.org/10.11111/2A9Z8Y7X', 5, NOW(), 'en-US', 0, NOW(), 5, NOW(), 5, NOW()),
  (3, 37, 'ORGANIZATIONAL', 'COMPLETE', 'https://doi.org/10.11111/2A3B4F3RFJH', NULL, NULL, 'en-US', 0, NOW(), 5, NOW(), 5, NOW());

INSERT INTO `planFunders` (`planId`, `projectFunderId`, `createdById`, `created`, `modifiedById`, `modified`)
VALUES
  (1, 1, 5, NOW(), 5, NOW()),
  (2, 2, 5, NOW(), 5, NOW()),
  (4, 3, 5, NOW(), 5, NOW());

INSERT INTO `planContributors` (`planId`, `projectContributorId`, `isPrimaryContact`, `createdById`, `created`, `modifiedById`, `modified`)
VALUES
  (1, 2, 1, 5, NOW(), 5, NOW()),
  (2, 8, 1, 5, NOW(), 5, NOW()),
  (2, 10, 0, 5, NOW(), 5, NOW()),
  (3, 6, 1, 5, NOW(), 5, NOW()),
  (4, 8, 0, 5, NOW(), 5, NOW()),
  (4, 10, 1, 5, NOW(), 5, NOW());

INSERT INTO `planContributorRoles` (`planContributorId`, `contributorRoleId`, `createdById`, `created`, `modifiedById`, `modified`)
VALUES
  (1, 1, 5, NOW(), 5, NOW()),
  (2, 1, 5, NOW(), 5, NOW()),
  (2, 2, 5, NOW(), 5, NOW()),
  (3, 1, 5, NOW(), 5, NOW()),
  (4, 3, 5, NOW(), 5, NOW()),
  (4, 4, 5, NOW(), 5, NOW()),
  (5, 1, 5, NOW(), 5, NOW()),
  (6, 2, 5, NOW(), 5, NOW());