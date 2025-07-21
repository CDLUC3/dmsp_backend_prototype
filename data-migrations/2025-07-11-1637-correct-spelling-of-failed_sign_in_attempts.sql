-- This migration corrects the spelling of the column `failed_sign_in_attemps` to `failed_sign_in_attempts`

ALTER TABLE `users`
  RENAME COLUMN `failed_sign_in_attemps` to `failed_sign_in_attempts`;
