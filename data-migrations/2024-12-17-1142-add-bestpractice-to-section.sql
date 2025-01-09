# Add column 'bestPractice' to sections
ALTER TABLE `sections`
ADD COLUMN `bestPractice` TINYINT(1) NOT NULL DEFAULT 0 AFTER `displayOrder`;
