-- Add description field to guidanceGroup table
ALTER TABLE `guidanceGroups`
ADD COLUMN `description` VARCHAR(2000) NOT NULL DEFAULT '' AFTER `name`;

-- Add description field to versionedGuidanceGroup table
ALTER TABLE `versionedGuidanceGroups`
ADD COLUMN `description` VARCHAR(2000) NOT NULL DEFAULT '' AFTER `name`;