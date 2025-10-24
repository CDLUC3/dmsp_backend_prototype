-- Add the slug column to tags table
ALTER TABLE `tags`
  ADD COLUMN `slug` VARCHAR(255);

UPDATE `tags` SET `slug` = TRIM(LOWER(REPLACE(`name`, ' ', '-')));

-- Make sure the slug column is unique and not null
ALTER TABLE `tags`
  MODIFY COLUMN `slug` VARCHAR(255) NOT NULL,
  ADD CONSTRAINT unique_tag_slug UNIQUE (`slug`);
