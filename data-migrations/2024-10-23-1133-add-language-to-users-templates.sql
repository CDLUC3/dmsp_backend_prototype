
# Add the missing languageId column to the users and templates tables
ALTER TABLE `users`
  ADD `languageId` CHAR(5) NOT NULL DEFAULT 'en-US';

ALTER TABLE `templates`
  ADD `languageId` CHAR(5) NOT NULL DEFAULT 'en-US';
