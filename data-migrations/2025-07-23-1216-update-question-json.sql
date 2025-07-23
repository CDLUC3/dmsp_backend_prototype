# Update the default seed data question JSON to conform to @dmptool/types 1.2.0
UPDATE `questions`
  SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"textArea","attributes":{"cols":20,"rows":2,"asRichText":true}}'
  WHERE `json` LIKE '%textArea%';

# Update range based questions
UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"dateRange","columns":{"start":{"label":"From"},"end":{"label":"To"}}}'
WHERE `json` NOT LIKE '%dateRange%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"numberRange","columns":{"start":{"label":"Min"},"end":{"label":"Max"}}}'
WHERE `json` NOT LIKE '%numberRange%';

# Update option based questions
UPDATE `questions`
  SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":{"label":"Option A","value":"a"}}'
  WHERE `json` NOT LIKE '%checkBoxes%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":{"label":"Option A","value":"a"}}'
WHERE `json` NOT LIKE '%radioButtons%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":{"label":"Option A","value":"a"}}'
WHERE `json` NOT LIKE '%selectBox%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"multiselectBox","attributes":{"multiple":true},"options":{"label":"Option A","value":"a"}}'
WHERE `json` NOT LIKE '%multiselectBox%';

# Just delete any test questions that were tables or typeaheads
DELETE FROM `questions` WHERE `json` NOT LIKE '%table%';
DELETE FROM `questions` WHERE `json` NOT LIKE '%typeaheadSearch%';
