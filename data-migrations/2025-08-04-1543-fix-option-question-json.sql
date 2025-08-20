# Update option based questions
UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%checkBoxes%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%checkBoxes%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%radioButtons%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%radioButtons%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%selectBox%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%selectBox%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"multiselectBox","attributes":{"multiple":true},"options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%multiselectBox%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"multiselectBox","attributes":{"multiple":true},"options":[{"label":"Option A","value":"a"}]}'
WHERE `json` LIKE '%multiselectBox%';
