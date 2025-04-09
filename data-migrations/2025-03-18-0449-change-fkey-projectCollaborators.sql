
ALTER TABLE `projectCollaborators`
  ADD COLUMN `projectId` INT NOT NULL,
  ADD CONSTRAINT `unique_project_collaborator` UNIQUE (`projectId`, `email`),
  ADD FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE `projectCollaborators`
  DROP COLUMN `planId`,
  DROP CONSTRAINT `unique_template_collaborator`,
  DROP FOREIGN KEY `projectCollaborators_ibfk_1`,
  DROP FOREIGN KEY `projectCollaborators_ibfk_2`;
