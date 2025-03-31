#!/bin/bash

if [ ! -f .env ]; then
  if [ $# -ne 1 ]; then
    echo 'If you do not have a Dotenv, you must specify the environment! (e.g. `./nuke-db.sh dev`)'
    exit 1
  else
    echo "No Dotenv file found. Fetching DB info from SSM"
    MYSQL_HOST=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbHost | jq .Parameter.Value | sed -e "s/\"//g"`)
    MYSQL_PORT=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPort | jq .Parameter.Value | sed -e "s/\"//g"`)
    MYSQL_DATABASE=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbName | jq .Parameter.Value | sed -e "s/\"//g"`)
    MYSQL_USER=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbUsername --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
    MYSQL_PASSWORD=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPassword --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
    MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
  fi
else
  echo "Load the DB info from Dotenv file"
  . .env

  # Run the migration using the env variable defined in the dotenv file
  if [ -z "${MYSQL_PASSWORD}" ]; then
    MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER}"
  else
    MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
  fi
fi

process_migration() {
  # See if the migration was already processed
  echo "Checking to see if $1 has been run ..."
  mariadb ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile = '$1';"
mariadb ${MYSQL_ARGS} ${MYSQL_DATABASE} -e "SHOW TABLES LIKE 'projectCollaborators';"

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
}

# Run this script to process any new SQL migrations on youor local DB.
for i in ./data-migrations/*.sql; do
  [ -f "$i" ] || break

  process_migration $i
  echo ''
  echo ''
done
