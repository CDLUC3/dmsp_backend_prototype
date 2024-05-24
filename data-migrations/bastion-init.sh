#!/bin/bash

# ==================================================================
# = This script is meant to be run from the Cloud9 Bastion instance
# ==================================================================
if [ $# -ne 1 ]; then
  echo 'Wrong number of arguments. Expecting 1: Whether or not to initialize the MySQL DB (e.g. `./bastion-init.sh true`)'
  exit 1
fi

echo 'Initializing Bastion to run MySQL data migrations'

# Install necessary packages
sudo yum install -y vim curl telnet
sudo yum groupinstall -y "Development Tools"
sudo yum install -y mariadb105-devel

# Get the DB info from SSM
MYSQL_HOST=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbHost | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PORT=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPort | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_DATABASE=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbName | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_USER=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbUsername --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PASSWORD=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPassword --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"

if [ "$1" -eq 'true' ]; then
  # Initialize the MySQL database
  CREATE_DATABASE="CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;"

  MIGRATIONS_TABLE="CREATE TABLE dataMigrations (
    migrationFile varchar(255) NOT NULL,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (migrationFile),
    CONSTRAINT unique_migration_files UNIQUE (migrationFile)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

  echo 'Creating the MySQL database'
  mysql ${MYSQL_ARGS} <<< $CREATE_DATABASE

  echo 'Creating the dataMigrations table'
  mysql ${MYSQL_ARGS} ${MYSQL_DATABASE} <<< $MIGRATIONS_TABLE
fi
