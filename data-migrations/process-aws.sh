#!/bin/bash

# ==================================================================
# = This script is meant to be run from the Cloud9 Bastion instance
# ==================================================================
if [ $# -ne 1 ]; then
  echo 'Wrong number of arguments. Expecting 1: the env (e.g. `./process-aws.sh dev`)'
  exit 1
fi

# Get the DB info from SSM
MYSQL_HOST=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbHost | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PORT=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPort | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_DATABASE=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbName | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_USER=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbUsername --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PASSWORD=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPassword --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)

MIGRATIONS_TABLE="CREATE TABLE dataMigrations (
  migrationFile varchar(255) NOT NULL,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migrationFile),
  CONSTRAINT unique_migration_files UNIQUE (migrationFile)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

process_migration() {
  # See if the migration was already processed
  echo "Checking to see if $2 has been run ..."
  EXISTS=$(mysql ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< "SELECT * FROM dataMigrations WHERE migrationFile = '$2';")
  if [ -z "$EXISTS" ]; then
    # If not run it
    echo "NEW MIGRATION - $2. Processing migration ..."
    mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} < $2
    WAS_PROCESSED=$?

    # If it worked then update the data-migrations table so we don't run it again!
    if [ $WAS_PROCESSED -eq 0 ]; then
      mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< "INSERT INTO dataMigrations (migrationFile) VALUES ('$2');"
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
