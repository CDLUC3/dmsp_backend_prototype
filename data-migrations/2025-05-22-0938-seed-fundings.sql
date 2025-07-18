INSERT INTO projectFundings (projectId, affiliationId, status, funderProjectNumber, grantId, funderOpportunityNumber, createdById, modifiedById)
(SELECT projectId, affiliationId, status, funderProjectNumber, grantId, funderOpportunityNumber, createdById, modifiedById FROM projectFunders ORDER BY id ASC);

INSERT INTO planFundings (planId, projectFundingId, createdById, modifiedById)
(SELECT planId, projectFunderId, createdById, modifiedById FROM planFunders ORDER BY id ASC);
