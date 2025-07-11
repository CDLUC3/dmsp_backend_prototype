-- Migration script remove email from the users table.  It should come from
-- the userEmails table instead in the code.

ALTER TABLE `users`
  DROP COLUMN `email`;
