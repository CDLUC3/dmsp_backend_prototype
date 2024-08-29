
if [ ! -f .env ]; then
  if [ $# -ne 1 ]; then
    echo 'If you do not have a Dotenv, you must specify the environment! (e.g. `./nuke-db.sh dev`)'
    exit 1
  else
    if [ $1 = "prd" ]; then
      echo 'NO!    This should never be run in production!'
    else
      echo "No Dotenv file found. Fetching DB info from SSM"
      MYSQL_HOST=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbHost | jq .Parameter.Value | sed -e "s/\"//g"`)
      MYSQL_PORT=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPort | jq .Parameter.Value | sed -e "s/\"//g"`)
      MYSQL_DATABASE=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbName | jq .Parameter.Value | sed -e "s/\"//g"`)
      MYSQL_USER=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbUsername --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
      MYSQL_PASSWORD=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPassword --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
      MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
    fi
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

FK_OFF="SET FOREIGN_KEY_CHECKS = 0;"
LIST_TABLES="SELECT table_name FROM information_schema.tables WHERE table_schema = '${MYSQL_DATABASE}';"
FK_ON="SET FOREIGN_KEY_CHECKS = 1;"

echo "Purging all tables from database ${MYSQL_DATABASE} ..."
mariadb $MYSQL_ARGS -N $MYSQL_DATABASE <<< $FK_OFF
declare -a TABLE_LIST=$(mariadb ${MYSQL_ARGS} -N ${MYSQL_DATABASE} <<< ${LIST_TABLES})

while IFS=' ' read -ra TABLES; do
  for i in "${TABLES[@]}"; do
    echo "  Dropping: $i"
    mariadb $MYSQL_ARGS -N $MYSQL_DATABASE <<< "${FK_OFF} DROP TABLE ${i}; ${FK_ON}"
  done
done <<< "$TABLE_LIST"

mariadb $MYSQL_ARGS -N $MYSQL_DATABASE <<< $FK_ON
echo "DONE"
