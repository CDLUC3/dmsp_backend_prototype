# Add the questionJSON column to the questions table
ALTER TABLE `questions`
  ADD COLUMN `questionType` JSON AFTER `questionText`;

ALTER TABLE `versionedQuestions`
  ADD COLUMN `questionType` JSON AFTER `questionText`;

# Add the answerJSON column to the answers table
ALTER TABLE `answers`
  ADD COLUMN `json` JSON AFTER `answerText`;
