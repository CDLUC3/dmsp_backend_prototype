# =============================================================
# = This script is meant to be run in the AWS CodeBuild step! =
# =============================================================
# Load the variables from dotenv
. .env

# The log file that records which migrations have already been run
LOG_FILE=./data-migrations/processed.log

# This is intended to be run during the AWS CodeBuild process to migrate new database changes
for i in ./data-migrations/*.sql; do
  # Make sure the processed.log file exists
  touch $LOG_FILE

  [ -f "$i" ] || break
  echo "Found a migration file: ${i} ..."

  # If we have already processed the file, skip it
  if cat $LOG_FILE | grep -q $i; then
    echo "    skipping ${i}, it has already been processed"
  else
    # Run the migration using the env variable defined in the dotenv file
    if [$MYSQL_PASSWORD == '']; then
      mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} ${MYSQL_DATABASE} < ${i}
    else
      mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < ${i}
    fi
    echo "    processed ${i}"

    # Record the file name in the log
    echo "${i}" >> $LOG_FILE
  fi
done
