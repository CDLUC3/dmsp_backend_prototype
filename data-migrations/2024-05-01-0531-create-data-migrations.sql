CREATE TABLE `dataMigrations` (
  `migrationFile` varchar(255) NOT NULL,
  `created` timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_migration_file UNIQUE (`migrationFile`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
