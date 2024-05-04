#!/bin/bash

# =============================================================
# = This script is meant to be run in the AWS CodeBuild step! =
# =============================================================
# Load the variables from dotenv
. .env

MIGRATIONS_TABLE="CREATE TABLE dataMigrations (
  migrationFile varchar(255) NOT NULL,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migrationFile),
  CONSTRAINT unique_migration_files UNIQUE (migrationFile)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

# Run the migration using the env variable defined in the dotenv file
if [$MYSQL_PASSWORD == '']; then
  MYSQL_ARGS="-h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER}"
else
  MYSQL_ARGS="-h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD}"
fi

process_migration() {
  # See if the migration was already processed
  echo "Checking to see if $1 has been run ..."
  EXISTS=$(mysql ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile = '$1';")
  if [ -z "$EXISTS" ]; then
    # If not run it
    echo "NEW MIGRATION - $1. Processing migration ..."
    mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} < $1
    WAS_PROCESSED=$?

    # If it worked then update the data-migrations table so we don't run it again!
    if [ $WAS_PROCESSED -eq 0 ]; then
      mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< "INSERT INTO dataMigrations (migrationFile) VALUES ('$1');"
      echo "    done"
    else
      echo "    Something went wrong!"
    fi
  else
    echo "    already processed."
  fi
}

# Check to see if we have already run the migration file
echo "Checking to see if the database has been initialized"
mysql ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile;"
INIT_CHECK=$?

# If the above failed, then it's a brand new DB, so we need to create the migrations table
if [ $INIT_CHECK -eq 1 ]; then
  echo '    it has not, initializing table ...'
  echo ''
  mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< $MIGRATIONS_TABLE
else
  echo '    it has.'
fi
echo ''

# Run this script to process any new SQL migrations on youor local DB.
for i in ./data-migrations/*.sql; do
  [ -f "$i" ] || break

  process_migration $i
  echo ''
  echo ''
done
