# Update 'questionTypes' table by removing type 'Rich Text Editor'

DELETE FROM `questionTypes`
WHERE id=7;

UPDATE `questionTypes`
SET `name` = 'Multi-select Box'
WHERE id=6;

UPDATE `questionTypes`
SET `name` = 'Select Box'
WHERE id=5;

UPDATE `questionTypes`
SET `name` = 'Check Boxes'
WHERE id=4;

UPDATE `questionTypes`
SET `name` = 'Radio Buttons'
WHERE id=3;

UPDATE `questionTypes`
SET `name` = 'Text Field'
WHERE id=2;

UPDATE `questionTypes`
SET `name` = 'Text Area'
WHERE id=1;

# Update 'questionTypes' table with 'usageDescription' text

UPDATE `questionTypes`
SET `usageDescription` = 'For questions that require longer answers, you can select formatting options too.'
WHERE id=1;

UPDATE `questionTypes`
SET `usageDescription` = 'For questions that require short, simple answers.'
WHERE id=2;

UPDATE `questionTypes`
SET `usageDescription` = 'For multiple choice questions where users select just one option.'
WHERE id=3;

UPDATE `questionTypes`
SET `usageDescription` = 'For multiple choice questions where users can select multiple options.'
WHERE id=4;

UPDATE `questionTypes`
SET `usageDescription` = 'For questions with a predefined set of options where users need to select one.'
WHERE id=5;

UPDATE `questionTypes`
SET `usageDescription` = 'For questions where multiple answers are valid. Allows users to select several options from a predefined list, providing flexibility in responses.'
WHERE id=6;