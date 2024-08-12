#!/bin/bash

# =============================================================
# = This script is meant to be run in the AWS CodeBuild step! =
# =============================================================
. .env

# Run the migration using the env variable defined in the dotenv file
if [ -z "${MYSQL_PASSWORD}" ]; then
  MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER}"
else
  MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
fi

echo $MYSQL_ARGS

process_migration() {
  # See if the migration was already processed
  echo "Checking to see if $1 has been run ..."
  EXISTS=$(mariadb ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile = '$1';")
  if [ -z "$EXISTS" ]; then
    # If not run it
    echo "NEW MIGRATION - $1. Processing migration ..."
    echo " mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} < $1"

    mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} < $1
    WAS_PROCESSED=$?

    # If it worked then update the data-migrations table so we don't run it again!
    if [ $WAS_PROCESSED -eq 0 ]; then
      mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< "INSERT INTO dataMigrations (migrationFile) VALUES ('$1');"
      echo "    done"
    else
      echo "    Something went wrong!"
      exit 1
    fi
  else
    echo "    it has."
  fi
}

# Run this script to process any new SQL migrations on youor local DB.
for i in ./data-migrations/*.sql; do
  [ -f "$i" ] || break

  process_migration $i
  echo ''
  echo ''
done
