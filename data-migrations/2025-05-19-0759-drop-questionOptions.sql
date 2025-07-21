# Drop the old questionOptions table
DROP TABLE `questionOptions`;

# Drop the old answerText column from the answers table
ALTER TABLE `answers` DROP COLUMN `answerText`;
