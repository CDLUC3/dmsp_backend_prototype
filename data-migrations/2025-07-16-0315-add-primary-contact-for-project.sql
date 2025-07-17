# Add primary contact flag to projectMembers
ALTER TABLE `projectMembers`
  ADD COLUMN `isPrimaryContact` TINYINT(1) NOT NULL DEFAULT 0;
