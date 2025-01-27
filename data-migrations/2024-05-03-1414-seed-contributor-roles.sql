INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Data Manager', 'https://credit.niso.org/contributor-roles/data-curation/', 'An individual engaged in management activities to annotate (produce metadata), scrub data and maintain research data (including software code, where it is necessary for interpreting the data itself) for initial use and later re-use.', 3, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Principal Investigator (PI)', 'https://credit.niso.org/contributor-roles/investigation/', 'An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.', 1, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Project Administrator', 'https://credit.niso.org/contributor-roles/project-administration/', 'An individual with management and coordination responsibility for the research activity planning and execution.', 2, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');
INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Other', 'http://dmptool.org/contributor_roles/other', '', 4, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');
