# This is a boolean to use the content from `sampleText` as the default answer
ALTER TABLE `questions`
ADD COLUMN `useSampleTextAsDefault` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sampleText`;
