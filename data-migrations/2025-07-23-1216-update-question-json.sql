# Update the default seed data question JSON to conform to @dmptool/types 1.2.0
UPDATE `questions`
  SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"textArea","attributes":{"cols":20,"rows":2,"asRichText":true}}'
  WHERE `json` LIKE '%asRichText%';
