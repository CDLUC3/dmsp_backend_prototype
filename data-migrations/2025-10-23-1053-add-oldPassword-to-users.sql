-- Add the oldPasswordHash column to users table
ALTER TABLE `users`
  ADD COLUMN `oldPasswordHash` VARCHAR(255);
