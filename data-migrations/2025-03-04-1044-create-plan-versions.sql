CREATE TABLE `planVersions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `dmp` JSON,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX planVersions_idx (`planId`, `created`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
