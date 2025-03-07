# Remove the NOT NULL constraint from users.affiliations
ALTER TABLE `users`
  CHANGE COLUMN `affiliationId` `affiliationId` VARCHAR(255);
