
CREATE TABLE IF NOT EXISTS `versionedSectionTags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `versionedSectionId` INT NOT NULL,
  `tagId` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int NOT NULL,
  INDEX versionedSectionTags_idx(`versionedSectionId`, `tagId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

ALTER TABLE versionedSectionTags
  ADD FOREIGN KEY (createdById) REFERENCES users(id),
  ADD FOREIGN KEY (modifiedById) REFERENCES users(id),
  ADD FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE;
