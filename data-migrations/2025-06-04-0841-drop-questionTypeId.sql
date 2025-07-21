
# Drop the old questionTypeId column from the questions table
ALTER TABLE `questions` DROP FOREIGN KEY `questions_ibfk_5`;
ALTER TABLE `questions` DROP COLUMN `questionTypeId`;
