# Update templates table column 'currentVersion' to 'latestPublishVersion'
ALTER TABLE `templates`
CHANGE COLUMN `currentVersion` `latestPublishVersion` VARCHAR(16);

# Add column 'latestPublishDate' to templates
ALTER TABLE `templates`
ADD COLUMN `latestPublishDate` TIMESTAMP NULL DEFAULT NULL AFTER `latestPublishVersion`;

# Update 'latestPublishDate' with the 'modified' value
UPDATE `templates`
SET `latestPublishDate` = `modified`