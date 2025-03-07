# Add column 'recommended' flag to licenses
ALTER TABLE `licenses`
ADD `recommended` TINYINT(1) NOT NULL DEFAULT 0 AFTER `description`;

# Set the default recommended licenses
UPDATE `licenses` SET `recommended` = 1
WHERE `name` IN ('CC-BY-4.0', 'CC-BY-NC-4.0', 'CC-BY-NC-ND-4.0', 'CC-BY-NC-SA-4.0',
'CC-BY-ND-4.0', 'CC-BY-SA-4.0', 'CC0-1.0');
