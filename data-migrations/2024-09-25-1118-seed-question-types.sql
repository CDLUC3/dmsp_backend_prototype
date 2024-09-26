INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById, isDefault)
(SELECT 'Rich Text Editor', '', id, id FROM users where email = 'super@example.com', true);

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Text Area', '', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Text Field', '', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Radio Buttons', '', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Check Boxes', '', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Select Box', '', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Multi-select Box', '', id, id FROM users where email = 'super@example.com');
