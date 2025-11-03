-- Add modified and modifiedById to workVersions table
ALTER TABLE `workVersions`
  RENAME COLUMN publishedDate TO publicationDate,
  MODIFY COLUMN abstractText MEDIUMTEXT,
  MODIFY COLUMN publicationVenue VARCHAR(1000);

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
    `workType`         VARCHAR(255) NOT NULL,
    `publicationDate`  DATE         NULL,
    `title`            TEXT         NULL,
    `abstractText`     MEDIUMTEXT         NULL,
    `authors`          JSON         NOT NULL,
    `institutions`     JSON         NOT NULL,
    `funders`          JSON         NOT NULL,
    `awards`           JSON         NOT NULL,
    `publicationVenue` VARCHAR(1000) NULL,
    `sourceName`       VARCHAR(255) NOT NULL,
    `sourceUrl`        VARCHAR(255) NOT NULL
  ) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

  DROP TEMPORARY TABLE IF EXISTS stagingRelatedWorks;
  CREATE TEMPORARY TABLE stagingRelatedWorks
  (
    `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `dmpDoi`             VARCHAR(255) NOT NULL,
    `workDoi`            VARCHAR(255) NOT NULL,
    `hash`               BINARY(16)   NOT NULL,
    `sourceType`         VARCHAR(32)  NOT NULL,
    `score`              FLOAT        NOT NULL,
    `scoreMax`           FLOAT        NOT NULL,
    `doiMatch`           JSON         NOT NULL,
    `contentMatch`       JSON         NOT NULL,
    `authorMatches`      JSON         NOT NULL,
    `institutionMatches` JSON         NOT NULL,
    `funderMatches`      JSON         NOT NULL,
    `awardMatches`       JSON         NOT NULL,

    INDEX (`dmpDoi`, `workDoi`),
    CONSTRAINT unique_hash UNIQUE (`dmpDoi`, `workDoi`)
  ) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;
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
INSERT IGNORE INTO workVersions (workId, hash, workType, publicationDate, title,
                                   abstractText, authors, institutions, funders,
                                   awards, publicationVenue, sourceName,
                                   sourceUrl)
SELECT w.id,
       s.hash,
       s.workType,
       s.publicationDate,
       s.title,
       s.abstractText,
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
    `planId`        INT UNSIGNED NOT NULL,
    `workVersionId` INT UNSIGNED NOT NULL,
    `workDoi`       VARCHAR(255) NOT NULL,
    UNIQUE KEY (`planId`, `workVersionId`)
  )
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

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
INSERT INTO relatedWorks (planId, workVersionId, sourceType, score, scoreMax, doiMatch,
                          contentMatch, authorMatches, institutionMatches,
                          funderMatches, awardMatches)
SELECT links.planId,
       links.workVersionId,
       s.sourceType,
       s.score,
       s.scoreMax,
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
    r.sourceType           = s.sourceType,
    r.score               = s.score,
    r.scoreMax           = s.scoreMax,
    -- status is never updated from the staging tables
    r.doiMatch           = s.doiMatch,
    r.contentMatch       = s.contentMatch,
    r.authorMatches      = s.authorMatches,
    r.institutionMatches = s.institutionMatches,
    r.funderMatches      = s.funderMatches,
    r.awardMatches       = s.awardMatches

WHERE r.status = 'PENDING'
  AND (
  r.workVersionId <> links.workVersionId
   OR NOT (r.score <=> s.score)
   OR NOT (r.scoreMax <=> s.scoreMax)
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
  WHERE r.status = 'PENDING'
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
