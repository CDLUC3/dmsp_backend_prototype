# Load the Dotenv file
. .env

# Run the migration using the env variable defined in the dotenv file
if [ -z "${MYSQL_PASSWORD}" ]; then
  MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER}"
else
  MYSQL_ARGS="-h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
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