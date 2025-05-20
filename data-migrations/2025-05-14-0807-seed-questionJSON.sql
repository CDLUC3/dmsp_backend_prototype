
# Set the questionType field for 'Text Field' questions
UPDATE `questions` SET `questionType` = '{"type":"text","meta":{"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field');

UPDATE `versionedQuestions` SET `questionType` = '{"type":"text","meta":{"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field');

UPDATE `answers` SET `json` = CONCAT('{"type":"text","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Field'));

# Set the questionType field for 'Text Area' questions
UPDATE `questions` SET `questionType` = '{"type":"textArea","attributes":{"rows":4},"meta":{"asRichText":true,"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area');

UPDATE `versionedQuestions` SET `questionType` = '{"type":"textArea","attributes":{"rows":4},"meta":{"asRichText":true,"schemaVersion":"1.0"}}'
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area');

UPDATE `answers` SET `json` = CONCAT('{"type":"textArea","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Text Area'));

# Set the questionType field for 'Radio Buttons' questions
UPDATE `questions` SET `questionType` = CONCAT(
  '{"type":"radioButtons","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Radio Buttons');

UPDATE `answers` SET `json` = CONCAT('{"type":"radioButtons","answer":"', `answers`.`answerText`, '","meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Radio Buttons'));

# Set the questionType field for 'Check Boxes' questions
UPDATE `questions` SET `questionType` = CONCAT(
  '{"type":"checkBoxes","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","checked":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes');

UPDATE `answers` SET `json` = CONCAT('{"type":"checkBoxes","answer":["', REPLACE(`answers`.`answerText`, ',', '","'), '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));

# Set the questionType field for 'Select Box' questions
UPDATE `questions` SET `questionType` = CONCAT(
  '{"type":"selectBox","options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Select Box');

UPDATE `answers` SET `json` = CONCAT('{"type":"selectBox","answer":["', `answers`.`answerText`, '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));

# Set the questionType field for 'Multi-select Box' questions
UPDATE `questions` SET `questionType` = CONCAT(
  '{"type":"selectBox","attributes":{"multiple":true},"options":[',
  (SELECT GROUP_CONCAT(
	CONCAT('{"attributes":{"label":"', qo.`text`, '","value":"', REPLACE(LOWER(qo.`text`), ' ', '_'), '","selected":', IF(qo.`isDefault` = 1, 'true', 'false'), '},"meta":{"schemaVersion":"1.0"}}')
  ORDER BY qo.`orderNumber` ASC) FROM `questionOptions` qo WHERE qo.`questionId` = `questions`.`id`),
  '],"meta":{"schemaVersion":"1.0"}}')
WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Multi-select Box');

UPDATE `answers` SET `json` = CONCAT('{"type":"selectBox","answer":["', REPLACE(`answers`.`answerText`, ',', '","'), '"],"meta":{"schemaVersion":"1.0"}}')
WHERE `versionedQuestionId` IN (SELECT `id` FROM `versionedQuestions` WHERE `questionTypeId` IN (SELECT `id` FROM `questionTypes` WHERE `name` = 'Check Boxes'));
