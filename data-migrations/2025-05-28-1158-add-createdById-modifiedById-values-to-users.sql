-- This SQL script updates the `createdById` and `modifiedById` fields in the `users` table because not having those values will break user updates
-- Update createdById and modifiedById for institutional admin users
UPDATE `users`
SET `createdById` = 1, `modifiedById` = 1
WHERE `email` IN ('super@example.com', 'admin@cdlib.org', 'admin@ucdavis.edu', 'admin@usc.edu', 'admin@stanford.edu', 'admin@www5.usp.br');

-- Update createdById and modifiedById for institutional researcher users
UPDATE `users`
SET `createdById` = 7, `modifiedById` = 7
WHERE `email` IN ('researcher@ucdavis.edu', 'researcher@usc.edu', 'researcher@stanford.edu', 'researcher@www5.usp.br');

-- Update createdById and modifiedById for funding agency admin users
UPDATE `users`
SET `createdById` = 11, `modifiedById` = 11
WHERE `email` IN ('admin@energy.gov', 'admin@moore.org', 'admin@nasa.gov', 'admin@nih.gov', 'admin@nsf.gov', 'admin@usgs.gov');
