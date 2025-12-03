-- Add tagId field to the guidance table, since guidance and tag now have a 1-to-1 relationship
ALTER TABLE `guidance`
ADD COLUMN `tagId` int UNSIGNED NULL AFTER `guidanceGroupId`;

-- Add tagId field to the versionedGuidance table, since guidance and tag now have a 1-to-1 relationship
ALTER TABLE `versionedGuidance`
ADD COLUMN `tagId` int UNSIGNED NULL AFTER `guidanceId`;

-- Drop guidanceTags table as it is no longer needed
DROP TABLE IF EXISTS `guidanceTags`;

-- Drop versionedGuidanceTags table as it is no longer needed
DROP TABLE IF EXISTS `versionedGuidanceTags`;