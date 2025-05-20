# Remove the old questionTypeId from questions and versionedQuestions tables
ALTER TABLE `questions` DROP FOREIGN KEY `questions_ibfk_5`;
ALTER TABLE `questions` DROP COLUMN `questionTypeId`;

ALTER TABLE `versionedQuestions` DROP FOREIGN KEY `versionedQuestions_ibfk_6`;
ALTER TABLE `versionedQuestions` DROP COLUMN `questionTypeId`;

# Drop the old questionTypes table
DROP TABLE `questionTypes`;

# Drop the old questionOptions table
DROP TABLE `questionOptions`;

# Drop the old versionedQuestionConditions table
DROP TABLE `versionedQuestionConditions`;

# Drop the old questionConditions table
DROP TABLE `questionConditions`;

# Drop the old answerText column from the answers table
ALTER TABLE `answers` DROP COLUMN `answerText`;
