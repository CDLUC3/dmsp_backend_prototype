# Remove the NOT NULL constraint from affiliationId
ALTER TABLE `users`
  MODIFY `affiliationId` VARCHAR(255) NULL;
