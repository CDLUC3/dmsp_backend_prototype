# Guidance tables creation migration
# ---------------------------------------------


# The main guidance tables, including guidance groups, guidance items, and their tags.

CREATE TABLE `guidanceGroups` (
                                `id` int NOT NULL,
                                `affiliationId` int NOT NULL AUTO_INCREMENT,
                                `name` text,
                                `isDirty` tinyint(1) NOT NULL DEFAULT '1',
                                `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
                                `latestPublishedVersion` text,
                                `latestPublishedDate` timestamp DEFAULT NULL,
                                `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `createdById` int NOT NULL,
                                `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `modifiedById` int NOT NULL,
                                PRIMARY KEY (`id`),
                                KEY `idx_guidanceGroups_affiliationId` (`affiliationId`),
                                KEY `idx_guidanceGroups_createdById` (`createdById`),
                                KEY `idx_guidanceGroups_modifiedById` (`modifiedById`),
                                CONSTRAINT `fk_guidanceGroups_affiliationId`
                                  FOREIGN KEY (`affiliationId`) REFERENCES `affiliations` (`id`) ON DELETE CASCADE,
                                CONSTRAINT `fk_guidanceGroups_createdById`
                                  FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                CONSTRAINT `fk_guidanceGroups_modifiedById`
                                  FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `guidance` (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `guidanceGroupId` int NOT NULL,
                          `guidanceText` text,
                          `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          `createdById` int NOT NULL,
                          `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          `modifiedById` int NOT NULL,
                          PRIMARY KEY (`id`),
                          KEY `idx_guidance_guidanceGroupId` (`guidanceGroupId`),
                          KEY `idx_guidance_createdById` (`createdById`),
                          KEY `idx_guidance_modifiedById` (`modifiedById`),
                          CONSTRAINT `fk_guidance_guidanceGroupId`
                            FOREIGN KEY (`guidanceGroupId`) REFERENCES `guidanceGroups` (`id`) ON DELETE CASCADE,
                          CONSTRAINT `fk_guidance_createdById`
                            FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                          CONSTRAINT `fk_guidance_modifiedById`
                            FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `guidanceTags` (
                              `id` int NOT NULL AUTO_INCREMENT,
                              `guidanceId` int NOT NULL,
                              `tagId` int NOT NULL,
                              `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              `createdById` int NOT NULL,
                              `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              `modifiedById` int NOT NULL,
                              PRIMARY KEY (`id`),
                              KEY `idx_guidanceTags_guidanceId` (`guidanceId`),
                              KEY `idx_guidanceTags_tagId` (`tagId`),
                              KEY `idx_guidanceTags_createdById` (`createdById`),
                              KEY `idx_guidanceTags_modififiedById` (`modifiedById`),
                              CONSTRAINT `fk_guidanceTags_guidanceId`
                                FOREIGN KEY (`guidanceId`) REFERENCES `guidance` (`id`) ON DELETE CASCADE,
                              CONSTRAINT `fk_guidanceTags_tagId`
                                FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE,
                              CONSTRAINT `fk_guidanceTags_createdById`
                                FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                              CONSTRAINT `fk_guidanceTags_modifiedById`
                                FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# Versioned guidance tables
CREATE TABLE `versionedGuidanceGroups` (
                                         `id` int NOT NULL AUTO_INCREMENT,
                                         `guidanceGroupId` int NOT NULL,
                                         `version` int DEFAULT NULL,
                                         `bestPractice` tinyint(1) NOT NULL DEFAULT '0',
                                         `active` tinyint(1) NOT NULL DEFAULT '0',
                                         `name` text,
                                         `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         `createdById` int NOT NULL,
                                         `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         `modifiedById` int NOT NULL,
                                         PRIMARY KEY (`id`),
                                         KEY `idx_vgg_guidanceGroupId` (`guidanceGroupId`),
                                         KEY `idx_vgg_createdById` (`createdById`),
                                         KEY `idx_vgg_modifiedById` (`modifiedById`),
                                         CONSTRAINT `fk_vgg_guidanceGroupId`
                                           FOREIGN KEY (`guidanceGroupId`) REFERENCES `guidanceGroups` (`id`) ON DELETE CASCADE,
                                         CONSTRAINT `fk_vgg_createdById`
                                           FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                         CONSTRAINT `fk_vgg_modifiedById`
                                           FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `versionedGuidance` (
                                   `id` int NOT NULL AUTO_INCREMENT,
                                   `versionedGuidanceGroupId` int NOT NULL,
                                   `tagId` int NOT NULL,
                                   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   `createdById` int NOT NULL,
                                   `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   `modifiedById` int NOT NULL,
                                   PRIMARY KEY (`id`),
                                   KEY `idx_vg_versionedGuidanceGroupId` (`versionedGuidanceGroupId`),
                                   KEY `idx_vg_tagId` (`tagId`),
                                   KEY `idx_vg_createdById` (`createdById`),
                                   KEY `idx_vg_modifiedById` (`modifiedById`),
                                   CONSTRAINT `fk_vg_versionedGuidanceGroupId`
                                     FOREIGN KEY (`versionedGuidanceGroupId`) REFERENCES `versionedGuidanceGroups` (`id`) ON DELETE CASCADE,
                                   CONSTRAINT `fk_vg_tagId`
                                     FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE,
                                   CONSTRAINT `fk_vg_createdById`
                                     FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                   CONSTRAINT `fk_vg_modifiedById`
                                     FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `versionedGuidanceTags` (
                                       `id` int NOT NULL AUTO_INCREMENT,
                                       `versionedGuidanceId` int NOT NULL,
                                       `tagId` int NOT NULL,
                                       `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       `createdById` int NOT NULL,
                                       `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       `modifiedById` int NOT NULL,
                                       PRIMARY KEY (`id`),
                                       KEY `idx_vgt_versionedGuidanceId` (`versionedGuidanceId`),
                                       KEY `idx_vgt_tagId` (`tagId`),
                                       KEY `idx_vgt_createdById` (`createdById`),
                                       KEY `idx_vgt_modifiedById` (`modifiedById`),
                                       CONSTRAINT `fk_vgt_versionedGuidanceId`
                                         FOREIGN KEY (`versionedGuidanceId`) REFERENCES `versionedGuidance` (`id`) ON DELETE CASCADE,
                                       CONSTRAINT `fk_vgt_tagId`
                                         FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE,
                                       CONSTRAINT `fk_vgt_createdById`
                                         FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                       CONSTRAINT `fk_vgt_modifiedById`
                                         FOREIGN KEY (`modifiedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
