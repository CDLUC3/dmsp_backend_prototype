
# Set the questionType field for 'Text Field' questions
UPDATE `questionTypes` SET `json` = '{"type":"text","attributes":{"maxLength":null,"minLength":0,"pattern":null},"meta":{"schemaVersion":"1.0"}}',
`isDefault` = 0 WHERE `name` = 'Text Field';

UPDATE `questions` SET `json` = '{"type":"text","meta":{"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field');

UPDATE `versionedQuestions` SET `json` = '{"type":"text","meta":{"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field');

UPDATE `answers` SET `json` = CONCAT('{"type":"text","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field'));

# Set the questionType field for 'Text Area' questions
UPDATE `questionTypes` SET `json` = '{"type":"textArea","attributes":{"cols":20,"maxLength":null,"minLength":0,"rows":4},"meta":{"asRichText":true,"schemaVersion":"1.0"}}',
`isDefault` = 1 WHERE `name` = 'Text Area';

UPDATE `questions` SET `json` = '{"type":"textArea","attributes":{"rows":4},"meta":{"asRichText":true,"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area');

UPDATE `versionedQuestions` SET `json` = '{"type":"textArea","attributes":{"rows":4},"meta":{"asRichText":true,"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area');

UPDATE `answers` SET `json` = CONCAT('{"type":"textArea","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area'));

# Set the questionType field for 'Radio Buttons' questions
UPDATE `questionTypes` SET `json` = '{"type":"radioButtons","options":[{"attributes":{"label":null,"selected":false,"value":null}}],"meta":{"schemaVersion":"1.0"}}',
`isDefault` = 0 WHERE `name` = 'Radio Buttons';

UPDATE `questions` SET `json` = CONCAT(
  '{"type":"radioButtons","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Radio Buttons');

UPDATE `answers` SET `json` = CONCAT('{"type":"radioButtons","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Radio Buttons'));

# Set the questionType field for 'Check Boxes' questions
UPDATE `questionTypes` SET `json` = '{"type":"checkBoxes","options":[{"attributes":{"checked":false,"label":null,"value":null}}],"meta":{"schemaVersion":"1.0"}}',
`isDefault` = 0 WHERE `name` = 'Check Boxes';

UPDATE `questions` SET `json` = CONCAT(
  '{"type":"checkBoxes","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","checked":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes');

UPDATE `answers` SET `json` = CONCAT('{"type":"checkBoxes","answer":["', REPLACE(`answers`.`answerText`, ',', '","'), '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));

# Set the questionType field for 'Select Box' questions
UPDATE `questionTypes` SET `json` = '{"type":"selectBox","options":[{"attributes":{"label":null,"selected":false,"value":null}}],"meta":{"schemaVersion":"1.0"}}',
`isDefault` = 0 WHERE `name` = 'Select Box';

UPDATE `questions` SET `json` = CONCAT(
  '{"type":"selectBox","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Select Box');

UPDATE `answers` SET `json` = CONCAT('{"type":"selectBox","answer":["', `answers`.`answerText`, '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));

# Set the questionType field for 'Multi-select Box' questions
UPDATE `questionTypes` SET `json` = '{"type":"selectBox","attributes":{"multiple":true},"options":[{"attributes":{"label":null,"selected":false,"value":null}}],"meta":{"schemaVersion":"1.0"}}',
`isDefault` = 0 WHERE `name` = 'Multi-select Box';

UPDATE `questions` SET `json` = CONCAT(
  '{"type":"selectBox","attributes":{"multiple":true},"options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Multi-select Box');

UPDATE `answers` SET `json` = CONCAT('{"type":"selectBox","answer":["', REPLACE(`answers`.`answerText`, ',', '","'), '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));

# Create the new Question Types
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Number Field', 'For questions that require a numeric value.', '{"type":"number","attributes":{"max":null,"min":0,"step":1},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Number Range', 'For questions that require a numerical range (e.g. From/To, Min/Max).', '{"type":"numberRange","columns":[{"type":"number","attributes":{"label":"From","max":null,"min":0,"step":1},"meta":{"schemaVersion":"1.0"}},{"type":"number","attributes":{"label":"To","max":null,"min":0,"step":1},"meta":{"schemaVersion":"1.0"}}]}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Currency Field', 'For questions that require a monetary amount (e.g. Cost or Budget).', '{"type":"currency","attributes":{"denomination":"USD","max":null,"min":0,"step":1},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Email Field', 'For questions that require requre email address(es).', '{"type":"email","attributes":{"maxLength":null,"minLength":0,"multiple":false,"pattern":null},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'URL Field', 'For questions that require a website, DOI or other URL.', '{"type":"url","attributes":{"maxLength":null,"minLength":0,"pattern":null},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Yes/No Field', 'For questions that require a simple Yes/No response.', '{"type":"boolean","attributes":{"checked":false},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Date Field', 'For questions that require a date.', '{"type":"date","attributes":{"max":null,"min":null,"step":1},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Date Range', 'For questions that require a date range (e.g. From/To, Start/End)', '{"type":"dateRange","columns":[{"type":"date","attributes":{"label":"From","max":null,"min":null,"step":1},"meta":{"schemaVersion":"1.0"}},{"type":"date","attributes":{"label":"To","max":null,"min":null,"step":1},"meta":{"schemaVersion":"1.0"}}],"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Table', 'For questions that require a tabular format.', '{"type":"table","attributes":{"canAddRows":true,"canRemoveRows":true,"initialRows":1,"maxRows":null,"minRows":null},"columns":[{"type":"text","attributes":{"maxLength":null,"minLength":0,"pattern":null},"meta":{"label":"Column A","schemaVersion":"1.0"}},{"type":"text","attributes":{"maxLength":null,"minLength":0,"pattern":null},"meta":{"label":"Column B","schemaVersion":"1.0"}}],"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO `questionTypes` (`name`, `usageDescription`, `json`, `isDefault`, `createdById`, `modifiedById`)
(SELECT 'Affiliation Search', 'For questions that require the user to select from a controlled list of institutions.', '{"type":"typeaheadSearch","graphQL":{"answerField":"uri","displayFields":[{"propertyName":"displayName","label":"Institution","labelTranslationKey": "SignupPage.institution"}],"query": "query Affiliations($name: String!){affiliations(name: $name) { totalCount nextCursor items {id displayName uri}}}","queryId":"useAffiliationsQuery","responseField":"affiliations.items","variables":[{"minLength":3,"label":"Search for your institution","labelTranslationKey":"SignupPage.institutionHelp","name":"term","type":"string"}]},"meta":{"schemaVersion":"1.0"}}', 0, `id`, `id` FROM `users` WHERE `email` = 'super@example.com');
