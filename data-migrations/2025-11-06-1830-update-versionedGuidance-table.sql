# Update versionedGuidance table to add missing fields
# ---------------------------------------------

# Add guidanceText and guidanceId fields to versionedGuidance table
ALTER TABLE `versionedGuidance`
  ADD COLUMN `guidanceId` int UNSIGNED DEFAULT NULL AFTER `versionedGuidanceGroupId`,
  ADD COLUMN `guidanceText` text NOT NULL AFTER `guidanceId`,
  ADD KEY `idx_vg_guidanceId` (`guidanceId`),
  ADD CONSTRAINT `fk_vg_guidanceId`
    FOREIGN KEY (`guidanceId`) REFERENCES `guidance` (`id`) ON DELETE SET NULL;
