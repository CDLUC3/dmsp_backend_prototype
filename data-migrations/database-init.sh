# Load the Dotenv file
. .env

CREATE_DATABASE="CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;"

MIGRATIONS_TABLE="CREATE TABLE dataMigrations (
  migrationFile varchar(255) NOT NULL,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migrationFile),
  CONSTRAINT unique_migration_files UNIQUE (migrationFile)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

echo "-h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p ${MYSQL_PASSWORD}"

# Create the Database
echo "Creating database ${MYSQL_DATABASE} ..."
mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p ${MYSQL_PASSWORD} <<< ${CREATE_DATABASE}

# Create the dataMigrations table which will be used going forward to store the migrations we have run
echo "Creating the dataMigrations table ..."
mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p ${MYSQL_PASSWORD} ${MYSQL_DATABASE} <<< ${MIGRATIONS_TABLE}
