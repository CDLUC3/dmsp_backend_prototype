# Alter both collaborators table to allow for NULL userIds
ALTER TABLE `templateCollaborators`
  MODIFY COLUMN `userId` INT NULL;

ALTER TABLE `projectCollaborators`
  MODIFY COLUMN `userId` INT NULL;
