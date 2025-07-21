# Add title to Plans
ALTER TABLE `plans`
  ADD COLUMN `title` VARCHAR(255) AFTER `versionedTemplateId`;

# Default all of the plan titles to the project title
UPDATE `plans` SET `title` = (SELECT `title` FROM `projects` WHERE `projects`.`id` = `plans`.`projectId`);
