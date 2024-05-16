# =============================================================
# = This script is meant to be run in the AWS CodeBuild step! =
# =============================================================

# TODO: Eventually modify this once we get AWS SecretsManager up and running
# SECRET_RESPONSE=$(aws secretsmanager get-secret-value --secret-id ${SECRETS_MANAGER_ARN})
# HOST=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .host)

# This is intended to be run during the AWS CodeBuild process to migrate new database changes
for i in *.sql; do
  [ -f "$i" ] || break
  echo "Found a database migration file: ${i} ..."
  echo "mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < $i"
  mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < $i
done
