UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"table","attributes":{"canAddRows":true,"canRemoveRows":true,"initialRows":1,"maxRows":null,"minRows":null},"columns":[{"heading":"Column A","content":{"type":"text","attributes":{"maxLength":100,"minLength":1},"meta":{"schemaVersion":"1.0"}}},{"heading":"Column B","content":{"type":"text","attributes":{"maxLength":100,"minLength":1},"meta":{"schemaVersion":"1.0"}}}]}'
WHERE `name` = 'Table';

UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type": "numberRange", "columns": [{"meta": {"schemaVersion": "1.0"}, "type": "number", "attributes": {"max": null, "min": 0, "step": 1, "label": "From"}}, {"meta": {"schemaVersion": "1.0"}, "type": "number", "attributes": {"max": null, "min": 0, "step": 1, "label": "To"}}]}'
WHERE `name` = 'Number Range';

UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":[{"attributes":{"label":"Option 1","value":"1","selected":false}}]}'
WHERE `name` = 'Radio Buttons';

UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"checkBoxes","options":[{"attributes":{"label":"Option 1","value":"1","checked":false}}]}'
WHERE `name` = 'Check Boxes';

UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":false},"options":[{"attributes":{"label":"Option 1","value":"1","selected":false}}]}'
WHERE `name` = 'Select Box';

UPDATE `questionTypes`
SET `json` = '{"meta":{"schemaVersion":"1.0"},"type":"selectBox","attributes":{"multiple":true},"options":[{"attributes":{"label":"Option 1","value":"1","selected":false}}]}'
WHERE `name` = 'Multi-select Box';
