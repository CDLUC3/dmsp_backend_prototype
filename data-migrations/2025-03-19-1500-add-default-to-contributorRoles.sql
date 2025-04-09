# Add a default flag to contributor roles
ALTER TABLE `contributorRoles` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT FALSE;

# Set the default flag for the 'other' role
UPDATE `contributorRoles` SET `isDefault` = TRUE, `uri` = 'https://dmptool.org/contributor_roles/other'
WHERE `label` = 'Other';
