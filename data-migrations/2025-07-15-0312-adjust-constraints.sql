# Remove the foreign key relationships the `users` table has on itself
ALTER TABLE users DROP FOREIGN KEY users_ibfk_1;
ALTER TABLE users DROP FOREIGN KEY users_ibfk_2;

# Remove the NOT NULL constraint from affiliationId
ALTER TABLE `users`
  MODIFY `affiliationId` VARCHAR(255) NULL;

# Missed removing this constraint in prior migration
ALTER TABLE `versionedQuestions`
  DROP FOREIGN KEY `versionedquestions_ibfk_6`,
  DROP COLUMN `questionTypeId`;
