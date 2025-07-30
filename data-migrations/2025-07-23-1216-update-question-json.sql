# Update the default seed data question JSON to conform to @dmptool/types 1.2.0
UPDATE `questions`
  SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"textArea","attributes":{"cols":20,"rows":2,"asRichText":true}}'
  WHERE `json` LIKE '%textArea%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"textArea","attributes":{"cols":20,"rows":2,"asRichText":true}}'
WHERE `json` LIKE '%textArea%';

# Update range based questions
UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"dateRange","columns":{"start":{"label":"From"},"end":{"label":"To"}}}'
WHERE `json` LIKE '%dateRange%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"dateRange","columns":{"start":{"label":"From"},"end":{"label":"To"}}}'
WHERE `json` LIKE '%dateRange%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"numberRange","columns":{"start":{"label":"Min"},"end":{"label":"Max"}}}'
WHERE `json` LIKE '%numberRange%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"numberRange","columns":{"start":{"label":"Min"},"end":{"label":"Max"}}}'
WHERE `json` LIKE '%numberRange%';

# Update option based questions
UPDATE `questions`
  SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":{"label":"Option A","value":"a"}}'
  WHERE `json` LIKE '%checkBoxes%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%checkBoxes%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%radioButtons%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%radioButtons%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%selectBox%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%selectBox%';

UPDATE `questions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"multiselectBox","attributes":{"multiple":true},"options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%multiselectBox%';

UPDATE `versionedQuestions`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"multiselectBox","attributes":{"multiple":true},"options":{"label":"Option A","value":"a"}}'
WHERE `json` LIKE '%multiselectBox%';

UPDATE `questions`
SET `json` = '{ "meta": { "schemaVersion": "1.0" }, "type": "table", "columns": [{ "content": { "meta": { "schemaVersion": "1.0" }, "type": "text", "attributes": { "maxLength": 100, "minLength": 1 } }, "heading": "Column A" }], "attributes": { "maxRows": 10, "minRows": 1, "canAddRows": true, "initialRows": 1, "canRemoveRows": true } }'
WHERE `json` LIKE '%table%';

UPDATE `versionedQuestions`
SET `json` = '{ "meta": { "schemaVersion": "1.0" }, "type": "table", "columns": [{ "content": { "meta": { "schemaVersion": "1.0" }, "type": "text", "attributes": { "maxLength": 100, "minLength": 1 } }, "heading": "Column A" }], "attributes": { "maxRows": 10, "minRows": 1, "canAddRows": true, "initialRows": 1, "canRemoveRows": true } }'
WHERE `json` LIKE '%table%';

UPDATE `questions`
SET `json` = '{ "meta": { "schemaVersion": "1.0" }, "type": "affiliationSearch", "graphQL": { "query": "query Affiliations($name: String!){ affiliations(name: $name) { totalCount nextCursor items { id displayName uri } } }", "variables": [{ "name": "name", "type": "string", "label": "Search for your institution", "minLength": 3 }], "answerField": "uri", "displayFields": [{ "label": "Institution", "propertyName": "displayName" }], "responseField": "affiliations.items" }, "attributes": { "help": "Search for an affiliation", "label": "Affiliation" } }'
WHERE `json` LIKE '%typeaheadSearch%';

UPDATE `versionedQuestions`
SET `json` = '{ "meta": { "schemaVersion": "1.0" }, "type": "affiliationSearch", "graphQL": { "query": "query Affiliations($name: String!){ affiliations(name: $name) { totalCount nextCursor items { id displayName uri } } }", "variables": [{ "name": "name", "type": "string", "label": "Search for your institution", "minLength": 3 }], "answerField": "uri", "displayFields": [{ "label": "Institution", "propertyName": "displayName" }], "responseField": "affiliations.items" }, "attributes": { "help": "Search for an affiliation", "label": "Affiliation" } }'
WHERE `json` LIKE '%typeaheadSearch%';
