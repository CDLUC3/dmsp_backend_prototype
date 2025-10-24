# Initialize the default affiliation and a default super admin user (will be used as the creator of other records)
# ---------------------------------------------------
# Disable foreign key checks to avoid constraint violations when creating the super admin user
SET FOREIGN_KEY_CHECKS = 0;
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`)
VALUES ('super@example.com', 'https://ror.org/03yrm5c26', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Super', 'Admin', 'SUPERADMIN');
SET FOREIGN_KEY_CHECKS = 1;

# Initialize the default affiliation
INSERT INTO `affiliations` (`uri`, `provenance`, `name`, `displayName`, `searchName`, `funder`, `fundrefId`, `homepage`, `acronyms`, `aliases`, `types`, `logoURI`, `logoName`, `contactName`, `contactEmail`, `ssoEntityId`, `feedbackEnabled`, `feedbackMessage`, `feedbackEmails`, `managed`, `createdById`, `created`, `modifiedById`, `modified`)
  (SELECT 'https://ror.org/03yrm5c26', 'ROR', 'California Digital Library', 'California Digital Library (cdlib.org)', 'California Digital Library | cdlib.org | CDL ', 0, NULL, 'http://www.cdlib.org/', '["CDL"]', '[]', '["Archive"]', NULL, NULL, 'UC3 Helpdesk', 'uc3@cdlib.org', NULL, false, '<p>Dear %{user_name},</p><p>"%{plan_name}" has been sent to your %{application_name} account administrator for feedback.</p><p>Please email %{organisation_email} with any questions about this process.</p>', '["uc3@cdlib.org"]', true, `users`.`id`, CURDATE(), `users`.`id`, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `affiliationEmailDomains` (`emailDomain`, `affiliationId`, `createdById`, `created`, `modifiedById`, `modified`)
  (SELECT 'cdlib.org', `affiliations`.`uri`, `affiliations`.`createdById`, CURDATE(), `affiliations`.`modifiedById`, CURDATE() FROM `affiliations` WHERE `affiliations`.`uri` = 'https://ror.org/03yrm5c26');

# Update the super admin user with the affiliation
UPDATE `users` SET `affiliationId` = 'https://ror.org/03yrm5c26' WHERE `email` = 'super@example.com';

# Initialize the contributor roles
# ---------------------------------------------------

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Conceptualization', 'https://credit.niso.org/contributor-roles/conceptualization/', 'Ideas; formulation or evolution of overarching research goals and aims.', 6, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Data Manager', 'https://credit.niso.org/contributor-roles/data-curation/', 'An individual engaged in management activities to annotate (produce metadata), scrub data and maintain research data (including software code, where it is necessary for interpreting the data itself) for initial use and later re-use.', 3, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Formal analysis', 'https://credit.niso.org/contributor-roles/formal-analysis/', 'Application of statistical, mathematical, computational, or other formal techniques to analyze or synthesize study data.', 8, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Funding acquisition', 'https://credit.niso.org/contributor-roles/funding-acquisition/', 'Acquisition of the financial support for the project leading to this publication.', 12, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Principal Investigator (PI)', 'https://credit.niso.org/contributor-roles/investigation/', 'An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.', 1, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Methodology', 'https://credit.niso.org/contributor-roles/methodology/', 'Development or design of methodology; creation of models.', 7, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Project Administrator', 'https://credit.niso.org/contributor-roles/project-administration/', 'An individual with management and coordination responsibility for the research activity planning and execution.', 2, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Resources', 'https://credit.niso.org/contributor-roles/resources/', 'Provision of study materials, reagents, laboratory samples, animals, instrumentation, computing resources, or other analysis tools.', 11, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Software', 'https://credit.niso.org/contributor-roles/software/', 'Programming, software development; designing computer programs; implementation of the computer code and supporting algorithms; testing of existing code components.', 4, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Supervision', 'https://credit.niso.org/contributor-roles/supervision/', 'Oversight and leadership responsibility for the research activity planning and execution, including mentorship external to the core team.', 5, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Validation', 'https://credit.niso.org/contributor-roles/validation/', 'Verification, either in a formal analysis or through a different approach, of the results of the study.', 9, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Visualization', 'https://credit.niso.org/contributor-roles/visualization/', 'Preparation, creation and/or presentation of the published work, specifically visualization/data presentation.', 10, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Writing - original draft', 'https://credit.niso.org/contributor-roles/writing-original-draft/', 'Preparation, creation and/or presentation of the published work, specifically writing the initial draft (including substantive translation).', 13, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, createdById, modifiedById)
  (SELECT 'Writing - review and editing', 'https://credit.niso.org/contributor-roles/writing-review-editing/', 'Preparation, creation and/or presentation of the published work by those from the original research group, specifically critical review, commentary or revision including pre-or post-publication stages.', 14, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

INSERT INTO contributorRoles (label, uri, description, displayOrder, isDefault, createdById, modifiedById)
  (SELECT 'Other', 'http://dmptool.org/contributor_roles/other', '', 99, 1, `users`.`id`, `users`.`id` FROM `users` WHERE `email` = 'super@example.com');

# Initialize the tags
# ---------------------------------------------------
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

# Initialize the question types
# ---------------------------------------------------
INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Text Area', 'For questions that require longer answers, you can select formatting options too.', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Text Field', 'For questions that require short, simple answers.', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Radio Buttons', 'For multiple choice questions where users select just one option.', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Check Boxes', 'For multiple choice questions where users can select multiple options.', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Select Box', 'For questions with a predefined set of options where users need to select one.', id, id FROM users where email = 'super@example.com');

INSERT INTO questionTypes (name, usageDescription, createdById, modifiedById)
(SELECT 'Multi-select Box', 'For questions where multiple answers are valid. Allows users to select several options from a predefined list, providing flexibility in responses.', id, id FROM users where email = 'super@example.com');

# Initialize the research domains
# ---------------------------------------------------
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'natural-sciences', 'Natural sciences', 'https://dmptool.org/research_domains/natural-sciences', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'engineering-and-technology', 'Engineering and Technology', 'https://dmptool.org/research_domains/engineering-and-technology', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'medical-and-health-sciences', 'Medical and Health Sciences', 'https://dmptool.org/research_domains/medical-and-health-sciences', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'agricultural-sciences', 'Agricultural Sciences', 'https://dmptool.org/research_domains/agricultural-sciences', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'social-sciences', 'Social Sciences', 'https://dmptool.org/research_domains/social-sciences', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'humanities', 'Humanities', 'https://dmptool.org/research_domains/humanities', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'mathematics', 'Mathematics', 'https://dmptool.org/research_domains/mathematics', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'computer-and-information-sciences', 'Computer and information sciences', 'https://dmptool.org/research_domains/computer-and-information-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'physical-sciences', 'Physical sciences', 'https://dmptool.org/research_domains/physical-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'chemical-sciences', 'Chemical sciences', 'https://dmptool.org/research_domains/chemical-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'earth-and-environmental-sciences', 'Earth and related environmental sciences', 'https://dmptool.org/research_domains/earth-and-environmental-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'biological-sciences', 'Biological sciences', 'https://dmptool.org/research_domains/biological-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-natural-sciences', 'Other natural sciences', 'https://dmptool.org/research_domains/other-natural-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'natural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'civil-engineering', 'Civil engineering', 'https://dmptool.org/research_domains/civil-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'electrical-electronic-information-engineering', 'Electrical engineering, electronic engineering,  information engineering', 'https://dmptool.org/research_domains/electrical-electronic-information-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'mechanical-engineering', 'Mechanical engineering', 'https://dmptool.org/research_domains/mechanical-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'chemical-engineering', 'Chemical engineering', 'https://dmptool.org/research_domains/chemical-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'materials-engineering', 'Materials engineering', 'https://dmptool.org/research_domains/materials-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'medical-engineering', 'Medical engineering', 'https://dmptool.org/research_domains/medical-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'environmental-engineering', 'Environmental engineering', 'https://dmptool.org/research_domains/environmental-engineering', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'environmental-biotechnology', 'Environmental biotechnology', 'https://dmptool.org/research_domains/environmental-biotechnology', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'industrial-biotechnology', 'Industrial Biotechnology', 'https://dmptool.org/research_domains/industrial-biotechnology', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'nano-technology', 'Nano-technology', 'https://dmptool.org/research_domains/nano-technology', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-engineering-and-technologies', 'Other engineering and technologies', 'https://dmptool.org/research_domains/other-engineering-and-technologies', (SELECT `id` FROM `researchDomains` WHERE name = 'engineering-and-technology'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'basic-medicine', 'Basic medicine', 'https://dmptool.org/research_domains/basic-medicine', (SELECT `id` FROM `researchDomains` WHERE name = 'medical-and-health-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'clinical-medicine', 'Clinical medicine', 'https://dmptool.org/research_domains/clinical-medicine', (SELECT `id` FROM `researchDomains` WHERE name = 'medical-and-health-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'health-sciences', 'Health sciences', 'https://dmptool.org/research_domains/health-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'medical-and-health-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'health-biotechnology', 'Health biotechnology', 'https://dmptool.org/research_domains/health-biotechnology', (SELECT `id` FROM `researchDomains` WHERE name = 'medical-and-health-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-medical-sciences', 'Other medical sciences', 'https://dmptool.org/research_domains/other-medical-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'medical-and-health-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'agriculture-forestry-fisheries', 'Agriculture, forestry, and fisheries', 'https://dmptool.org/research_domains/agriculture-forestry-fisheries', (SELECT `id` FROM `researchDomains` WHERE name = 'agricultural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'animal-and-dairy-science', 'Animal and dairy science', 'https://dmptool.org/research_domains/animal-and-dairy-science', (SELECT `id` FROM `researchDomains` WHERE name = 'agricultural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'veterinary-science', 'Veterinary science', 'https://dmptool.org/research_domains/veterinary-science', (SELECT `id` FROM `researchDomains` WHERE name = 'agricultural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'agricultural-biotechnology', 'Agricultural biotechnology', 'https://dmptool.org/research_domains/agricultural-biotechnology', (SELECT `id` FROM `researchDomains` WHERE name = 'agricultural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-agricultural-sciences', 'Other agricultural sciences', 'https://dmptool.org/research_domains/other-agricultural-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'agricultural-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'psychology', 'Psychology', 'https://dmptool.org/research_domains/psychology', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'economics-and-business', 'Economics and business', 'https://dmptool.org/research_domains/economics-and-business', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'educational-sciences', 'Educational sciences', 'https://dmptool.org/research_domains/educational-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'sociology', 'Sociology', 'https://dmptool.org/research_domains/sociology', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'law', 'Law', 'https://dmptool.org/research_domains/law', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'political-science', 'Political science', 'https://dmptool.org/research_domains/political-science', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'geography', 'Social and economic geography', 'https://dmptool.org/research_domains/geography', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'media-and-communications', 'Media and communications', 'https://dmptool.org/research_domains/media-and-communications', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-social-sciences', 'Other social sciences', 'https://dmptool.org/research_domains/other-social-sciences', (SELECT `id` FROM `researchDomains` WHERE name = 'social-sciences'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'history-and-archaeology',	'History and archaeology', 'https://dmptool.org/research_domains/history-and-archaeology', (SELECT `id` FROM `researchDomains` WHERE name = 'humanities'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'languages-and-literature',	'Languages and literature', 'https://dmptool.org/research_domains/languages-and-literature', (SELECT `id` FROM `researchDomains` WHERE name = 'humanities'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'philosophy-ethics-religion',	'Philosophy, ethics and religion', 'https://dmptool.org/research_domains/philosophy-ethics-religion', (SELECT `id` FROM `researchDomains` WHERE name = 'humanities'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'art', 'Art (arts, history of arts, performing arts, music)', 'https://dmptool.org/research_domains/art', (SELECT `id` FROM `researchDomains` WHERE name = 'humanities'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `researchDomains` (`name`, `description`, `uri`, `parentResearchDomainId`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'other-humanities', 'Other humanities', 'https://dmptool.org/research_domains/other-humanities', (SELECT `id` FROM `researchDomains` WHERE name = 'humanities'), users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');

# Initialize the project output types
# ---------------------------------------------------
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'audiovisual', 'Audiovisual', 'https://dmptool.org/output_types/audiovisual', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'collection', 'Collection', 'https://dmptool.org/output_types/collection', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'data paper', 'Data paper', 'https://dmptool.org/output_types/data_paper', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'dataset', 'Dataset', 'https://dmptool.org/output_types/dataset', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'event', 'Event', 'https://dmptool.org/output_types/event', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'image', 'Image', 'https://dmptool.org/output_types/image', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'interactive resource', 'Interactive resource', 'https://dmptool.org/output_types/interactive_resource', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'model representation', 'Model representation', 'https://dmptool.org/output_types/model_representation', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'physical object', 'Physical object', 'https://dmptool.org/output_types/physical_object', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'service', 'Service', 'https://dmptool.org/output_types/service', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'software', 'Software', 'https://dmptool.org/output_types/software', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'sound', 'Sound', 'https://dmptool.org/output_types/sound', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'text', 'Text', 'https://dmptool.org/output_types/text', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
INSERT INTO `projectOutputTypes` (`name`, `description`, `uri`, `createdById`, `created`, `modifiedById`, `modified`) (SELECT 'workflow', 'Workflow', 'https://dmptool.org/output_types/workflow', users.id, CURDATE(), users.id, CURDATE() FROM users WHERE email = 'super@example.com');
