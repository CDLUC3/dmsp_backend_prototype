# Add optionalSubset column to guidanceGroups and versionedGuidanceGroups
# ---------------------------------------------

# Add optionalSubset to guidanceGroups table
ALTER TABLE `guidanceGroups` 
ADD COLUMN `optionalSubset` tinyint(1) NOT NULL DEFAULT '0' AFTER `bestPractice`;

# Add optionalSubset to versionedGuidanceGroups table
ALTER TABLE `versionedGuidanceGroups` 
ADD COLUMN `optionalSubset` tinyint(1) NOT NULL DEFAULT '0' AFTER `bestPractice`;
