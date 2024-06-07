ALTER TABLE `users`
  ADD COLUMN `role` VARCHAR(16) AFTER `password`;

ALTER TABLE `users`
  ADD COLUMN `givenName` VARCHAR(255) AFTER `role`;

ALTER TABLE `users`
  ADD COLUMN `surName` VARCHAR(255) AFTER `givenName`;
