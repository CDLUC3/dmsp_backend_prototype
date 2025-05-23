# Add the json column to the questionTypes table
ALTER TABLE `questionTypes`
  ADD COLUMN `json` JSON AFTER `isDefault`;

# Add the json column to the questions table
ALTER TABLE `questions`
  ADD COLUMN `json` JSON AFTER `questionText`;

ALTER TABLE `versionedQuestions`
  ADD COLUMN `json` JSON AFTER `questionText`;

# Add the json column to the answers table
ALTER TABLE `answers`
  ADD COLUMN `json` JSON AFTER `answerText`;
