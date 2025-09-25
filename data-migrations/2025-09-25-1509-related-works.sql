CREATE TABLE IF NOT EXISTS `works`
(
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `doi`         VARCHAR(255) NOT NULL,
  `created`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT          NULL,

  CONSTRAINT unique_doi UNIQUE (`doi`),
  CONSTRAINT fk_works_users_createdById FOREIGN KEY (createdById) REFERENCES users (id)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `workVersions`
(
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `workId`           INT UNSIGNED NOT NULL,
  `hash`             BINARY(16)   NOT NULL,
  `type`             VARCHAR(255) NOT NULL,
  `publishedDate`    DATE         NULL,
  `title`            TEXT         NULL,
  `abstract`         TEXT         NULL,
  `authors`          JSON         NOT NULL,
  `institutions`     JSON         NOT NULL,
  `funders`          JSON         NOT NULL,
  `awards`         JSON         NOT NULL,
  `publicationVenue` VARCHAR(255) NULL,
  `sourceName`       VARCHAR(255) NOT NULL,
  `sourceUrl`        VARCHAR(255) NOT NULL,
  `created`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById`      INT          NULL,

  CONSTRAINT fk_workVersions_works_workId FOREIGN KEY (workId) REFERENCES works (id),
  CONSTRAINT unique_hash UNIQUE (`workId`, `hash`),
  CONSTRAINT fk_workVersions_users_createdById FOREIGN KEY (createdById) REFERENCES users (id)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `relatedWorks`
(
  `id`                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `planId`             INT          NOT NULL,
  `workVersionId`      INT UNSIGNED NOT NULL,
  `score`              FLOAT        NOT NULL,
  `status`             VARCHAR(256)          DEFAULT 'pending',
  `doiMatch`           JSON         NOT NULL,
  `contentMatch`       JSON         NOT NULL,
  `authorMatches`      JSON         NOT NULL,
  `institutionMatches` JSON         NOT NULL,
  `funderMatches`      JSON         NOT NULL,
  `awardMatches`     JSON         NOT NULL,
  `created`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById`        INT,
  `modified`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedById`       INT,

  CONSTRAINT unique_planId_workVersionId UNIQUE (`planId`, `workVersionId`),
  CONSTRAINT fk_relatedWorks_workVersions_workVersionId FOREIGN KEY (workVersionId) REFERENCES workVersions (id),
  CONSTRAINT fk_relatedWorks_plans_planId FOREIGN KEY (planId) REFERENCES plans (id),
  CONSTRAINT fk_relatedWorks_users_createdById FOREIGN KEY (createdById) REFERENCES users (id),
  CONSTRAINT fk_relatedWorks_users_modifiedById FOREIGN KEY (modifiedById) REFERENCES users (id)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;


-- Procedure to create staging tables for related works
DELIMITER $$

DROP PROCEDURE IF EXISTS create_related_works_staging_tables;
CREATE PROCEDURE `create_related_works_staging_tables`()
BEGIN
  DROP TEMPORARY TABLE IF EXISTS stagingWorkVersions;
  CREATE TEMPORARY TABLE stagingWorkVersions
  (
    `doi`              VARCHAR(255) NOT NULL PRIMARY KEY,
    `hash`             BINARY(16)   NOT NULL,
    `type`             VARCHAR(255) NOT NULL,
    `publishedDate`    DATE         NULL,
    `title`            TEXT         NULL,
    `abstract`         TEXT         NULL,
    `authors`          JSON         NOT NULL,
    `institutions`     JSON         NOT NULL,
    `funders`          JSON         NOT NULL,
    `awards`         JSON         NOT NULL,
    `publicationVenue` VARCHAR(255) NULL,
    `sourceName`       VARCHAR(255) NOT NULL,
    `sourceUrl`        VARCHAR(255) NOT NULL
  ) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;

  DROP TEMPORARY TABLE IF EXISTS stagingRelatedWorks;
  CREATE TEMPORARY TABLE stagingRelatedWorks
  (
    `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `dmpDoi`             VARCHAR(255) NOT NULL,
    `workDoi`            VARCHAR(255) NOT NULL,
    `hash`               BINARY(16)   NOT NULL,
    `score`              FLOAT        NOT NULL,
    `doiMatch`           JSON         NOT NULL,
    `contentMatch`       JSON         NOT NULL,
    `authorMatches`      JSON         NOT NULL,
    `institutionMatches` JSON         NOT NULL,
    `funderMatches`      JSON         NOT NULL,
    `awardMatches`     JSON         NOT NULL,

    INDEX (`dmpDoi`, `workDoi`),
    CONSTRAINT unique_hash UNIQUE (`dmpDoi`, `workDoi`)
  ) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
END$$

DELIMITER ;

-- Procedure to upsert and delete related works based on data in staging tables
DELIMITER $$

DROP PROCEDURE IF EXISTS batch_update_related_works;
CREATE PROCEDURE `batch_update_related_works`()
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

  START TRANSACTION;

  -- works: insert new works (DOIs) and skip rows that would violate the doi unique constraint
  INSERT IGNORE INTO works (doi)
  SELECT doi
  FROM stagingWorkVersions;

  -- workVersions: insert new work versions
  INSERT IGNORE INTO workVersions (workId, hash, type, publishedDate, title,
                                   abstract, authors, institutions, funders,
                                   awards, publicationVenue, sourceName,
                                   sourceUrl)
  SELECT w.id,
         s.hash,
         s.type,
         s.publishedDate,
         s.title,
         s.abstract,
         s.authors,
         s.institutions,
         s.funders,
         s.awards,
         s.publicationVenue,
         s.sourceName,
         s.sourceUrl
  FROM stagingWorkVersions s
         INNER JOIN works w ON s.doi = w.doi;

  -- Resolve all IDs
  DROP TEMPORARY TABLE IF EXISTS resolvedStagingLinks;
  CREATE TEMPORARY TABLE resolvedStagingLinks
  (
    `id`            INT UNSIGNED NOT NULL PRIMARY KEY,
    `planId`        INT          NOT NULL,
    `workVersionId` INT UNSIGNED NOT NULL,
    `workDoi`       VARCHAR(255) NOT NULL,
    UNIQUE KEY (`planId`, `workVersionId`)
  )
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;

  INSERT INTO resolvedStagingLinks (id, planId, workVersionId, workDoi)
  SELECT s.id  AS id,
         p.id  AS planId,
         wv.id AS workVersionId,
         s.workDoi
  FROM stagingRelatedWorks s
         JOIN plans p
              ON LOWER(CONCAT('https://doi.org/', s.dmpDoi)) = LOWER(p.dmpId)
         JOIN works w ON s.workDoi = w.doi
         JOIN workVersions wv ON wv.workId = w.id AND wv.hash = s.hash;

  -- relatedWorks: insert new related works
  INSERT INTO relatedWorks (planId, workVersionId, score, doiMatch,
                            contentMatch, authorMatches, institutionMatches,
                            funderMatches, awardMatches)
  SELECT links.planId,
         links.workVersionId,
         s.score,
         s.doiMatch,
         s.contentMatch,
         s.authorMatches,
         s.institutionMatches,
         s.funderMatches,
         s.awardMatches
  FROM resolvedStagingLinks links
         JOIN stagingRelatedWorks s ON links.id = s.id
         LEFT JOIN (
    relatedWorks r
      JOIN workVersions wv ON r.workVersionId = wv.id
      JOIN works w ON wv.workId = w.id
    ) ON links.planId = r.planId AND links.workDoi = w.doi
  WHERE r.id IS NULL;

  -- relatedWorks: update pending related works
  UPDATE relatedWorks r
    JOIN workVersions wv ON r.workVersionId = wv.id
    JOIN works w ON wv.workId = w.id
    JOIN resolvedStagingLinks links ON r.planId = links.planId AND
                                       w.doi = links.workDoi
    JOIN stagingRelatedWorks s ON links.id = s.id
  SET r.workVersionId      = links.workVersionId,
      r.score              = s.score,
      -- status is never updated from the staging tables
      r.doiMatch           = s.doiMatch,
      r.contentMatch       = s.contentMatch,
      r.authorMatches      = s.authorMatches,
      r.institutionMatches = s.institutionMatches,
      r.funderMatches      = s.funderMatches,
      r.awardMatches     = s.awardMatches

  WHERE r.status = 'pending'
    AND (
    r.workVersionId <> links.workVersionId
      OR NOT (r.score <=> s.score)
      OR NOT (r.doiMatch <=> s.doiMatch)
      OR NOT (r.contentMatch <=> s.contentMatch)
      OR NOT (r.authorMatches <=> s.authorMatches)
      OR NOT (r.institutionMatches <=> s.institutionMatches)
      OR NOT (r.funderMatches <=> s.funderMatches)
      OR NOT (r.awardMatches <=> s.awardMatches)
    );

  -- relatedWorks: delete with pending status that don't exist in stagingRelatedWorks
  DELETE r
  FROM relatedWorks r
         LEFT JOIN resolvedStagingLinks links ON r.planId = links.planId AND
                                                 r.workVersionId =
                                                 links.workVersionId
  WHERE r.status = 'pending'
    AND links.id IS NULL;

  -- workVersions: delete those that have no remaining relatedWorks
  DELETE wv
  FROM workVersions wv
         LEFT JOIN relatedWorks r ON r.workVersionId = wv.id
  WHERE r.id IS NULL;

  -- works: delete those that have no remaining workVersions
  DELETE w
  FROM works w
         LEFT JOIN workVersions wv ON wv.workId = w.id
  WHERE wv.id IS NULL;
  COMMIT;
END$$

DELIMITER ;
