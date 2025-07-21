
# Seed the versionedSectionTags table with data from the sectionTags table
INSERT INTO versionedSectionTags
  (versionedSectionId, tagId, created, createdById, modified, modifiedById)
(SELECT vs.id, st.tagId, CURDATE(), vs.createdById, CURDATE(), vs.modifiedById
 FROM versionedSections vs
  INNER JOIN sections s ON vs.sectionId = s.id
    INNER JOIN sectionTags st ON st.sectionId = s.id);
