-- Rename visibility to latestPublishVisibility in templates
ALTER TABLE `templates`
  CHANGE COLUMN `visibility` `latestPublishVisibility` VARCHAR(16) NOT NULL;
