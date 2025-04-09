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

CREATE_DATABASE="CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;"

# Create the Database
echo "Creating database ${MYSQL_DATABASE} ..."
mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} <<< ${CREATE_DATABASE}

CREATE_MIGRATIONS_TABLE="USE ${MYSQL_DATABASE}; CREATE TABLE dataMigrations (
    migrationFile varchar(255) NOT NULL,
    created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_migration_file UNIQUE (migrationFile)
  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;"

# Create the Database
echo "Creating the dataMigrations table ..."
mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} <<< ${CREATE_MIGRATIONS_TABLE}

echo "Setup complete. You may now run data-migrations/process.sh to build the database tables"
