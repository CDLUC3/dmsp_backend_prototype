-- Migration script to make questionTypeId nullable in versionedQuestions table
-- This will resolve the "Field 'questionTypeId' doesn't have a default value" error

ALTER TABLE `versionedQuestions` 
MODIFY COLUMN `questionTypeId` INT NULL;