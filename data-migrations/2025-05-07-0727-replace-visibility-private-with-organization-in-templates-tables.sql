UPDATE templates
SET visibility = 'ORGANIZATION'
WHERE visibility = 'PRIVATE';

UPDATE versionedTemplates
SET visibility = 'ORGANIZATION'
WHERE visibility = 'PRIVATE';