
INSERT INTO memberRoles (label, uri, description, displayOrder, isDefault, createdById, modifiedById)
(SELECT label, uri, description, displayOrder, isDefault, createdById, modifiedById FROM contributorRoles ORDER BY id ASC);

INSERT INTO projectMembers (projectId, affiliationId, givenName, surName, orcid, email, createdById, modifiedById)
(SELECT projectId, affiliationId, givenName, surName, orcid, email, createdById, modifiedById FROM projectContributors ORDER BY id ASC);

INSERT INTO projectMemberRoles (projectMemberId, memberRoleId, createdById, modifiedById)
(SELECT projectContributorId, contributorRoleId, createdById, modifiedById FROM projectContributorRoles ORDER BY id ASC);

INSERT INTO planMembers (planId, projectMemberId, isPrimaryContact, createdById, modifiedById)
(SELECT planId, projectContributorId, isPrimaryContact, createdById, modifiedById FROM planContributors ORDER BY id ASC);

INSERT INTO planMemberRoles (planMemberId, memberRoleId, createdById, modifiedById)
(SELECT planContributorId, contributorRoleId, createdById, modifiedById FROM planContributorRoles ORDER BY id ASC);
