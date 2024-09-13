INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data description', 'The types of data that will be collected along with their formats and estimated volumes.', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data organization & documentation', 'Descriptions naming conventions, metadata standards that will be used along with data dictionaries and glossaries', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Security & privacy', 'Who will have access to the data and how that access will be controlled, how the data will be encrypted and relevant compliance with regulations or standards (e.g. HIPAA, GDPR)', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Ethical considerations', 'Ethical considerations during data collection, use or sharing and how informed consent will be obtained from participants', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Training & support', 'Training that will be provided to team members on data management practices and support for data issues', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data sharing', 'Policies and procedures for how the data will be shared with collaborators and/or the public, restrictions to access and the licenses and permissions used', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data storage & backup', 'Where the data will be stored, the backup strategy and frequency and how long it will be retained', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data quality & integrity', 'Methods used to ensure data quality and integrity and any procedures used for validation', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Roles & responsibilities', 'Desriptions of the project team members and their roles', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Budget', 'Description of the budget available for data collection, use and preservation including software licensing, personnel and storage costs', id, id FROM users where email = 'super@example.com');

INSERT INTO tags (name, description, createdById, modifiedById)
(SELECT 'Data collection', 'How the data will be collected or generated, primary and secondary sources that will be used and any instruments that will be used', id, id FROM users where email = 'super@example.com');
