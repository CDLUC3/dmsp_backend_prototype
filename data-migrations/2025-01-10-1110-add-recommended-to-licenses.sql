# Add column 'recommended' flag to licenses
ALTER TABLE `licenses`
ADD `recommended` TINYINT(1) NOT NULL DEFAULT 0 AFTER `description`;
