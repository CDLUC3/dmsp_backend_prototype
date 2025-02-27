ALTER TABLE `plans`
DROP COLUMN `lastUpdatedOn`,
DROP COLUMN `lastUpdatedBy`,
ADD COLUMN `registeredById` INT AFTER `dmpId`,
ADD COLUMN `registered` TIMESTAMP AFTER `registeredById`,
ADD COLUMN `languageId` CHAR(5) NOT NULL DEFAULT 'en-US' AFTER `registered`,
ADD COLUMN `featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `languageId`,
ADD COLUMN `lastSynced` TIMESTAMP NULL DEFAULT NULL AFTER `featured`,
ADD INDEX `plans_status_idx` (`status`),
ADD INDEX `plans_featured_idx` (`featured`),
ADD INDEX `plans_lastSynced_idx` (`lastSynced`);

ALTER TABLE `planContributors`
DROP COLUMN `roles`,
ADD COLUMN `isPrimaryContact` TINYINT(1) NOT NULL DEFAULT 0 AFTER `projectContributorId`;
