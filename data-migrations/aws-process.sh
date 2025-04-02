# Note that all env variables are defined in the Codebuild project

CREATE_DATABASE="CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;"

CREATE_MIGRATIONS_TABLE="USE ${MYSQL_DATABASE}; CREATE TABLE IF NOT EXISTS dataMigrations (
    migrationFile varchar(255) NOT NULL,
    created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_migration_file UNIQUE (migrationFile)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

echo "Checking to see if ${MYSQL_DATABASE} exists ..."
EXISTS=$(mariadb ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${MYSQL_DATABASE}';")

# If the database does not exist, create it and the dataMigrations table
if [ -z "$EXISTS" ]; then
  echo "    it does not."

  echo "    Creating database ${MYSQL_DATABASE} if it does not exist ..."
  mariadb -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} <<< ${CREATE_DATABASE}

  echo "Creating the dataMigrations table if it does not exist ..."
  mariadb -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} <<< ${CREATE_MIGRATIONS_TABLE}
else
  echo "    it does."
fi

# Process each potential migration file
for i in ./data-migrations/*.sql; do
  [ -f "$i" ] || break

  # See if the migration was already processed
  echo "Checking to see if $i has been run ..."
  EXISTS=$(mariadb ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile = '$i';")

  if [ -z "$EXISTS" ]; then
    # If not run it
    echo "NEW MIGRATION - $i. Processing migration ..."
    echo " mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} < $i"

    mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} < $i
    WAS_PROCESSED=$?

    # If it worked then update the data-migrations table so we don't run it again!
    if [ $WAS_PROCESSED -eq 0 ]; then
      mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< "INSERT INTO dataMigrations (migrationFile) VALUES ('$i');"
      echo "    done"
      # Sleep for 2 seconds to allow the DB engine to fully process the last script
      # MariaDB tables have a tendency to get corrupted if too many schema changes happen in rapid sequence
      sleep 2
    else
      echo "    Something went wrong!"
      exit 1
    fi
  else
    echo "    it has."
  fi
  echo ''
  echo ''
done
