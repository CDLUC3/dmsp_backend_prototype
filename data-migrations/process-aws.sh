# =============================================================
# = This script is meant to be run in the AWS CodeBuild step! =
# =============================================================

# TODO: Eventually modify this once we get AWS SecretsManager up and running
# SECRET_RESPONSE=$(aws secretsmanager get-secret-value --secret-id ${SECRETS_MANAGER_ARN})
# HOST=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .host)

if [ $# -ne 1 ]; then
  echo 'Wrong number of arguments. Expecting 1: the env (e.g. `./process-aws.sh dev`)'
  exit 1
fi

MYSQL_HOST=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbHost | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PORT=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPort | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_DATABASE=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbName | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_USER=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbUsername --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)
MYSQL_PASSWORD=$(echo `aws ssm get-parameter --name /uc3/dmp/hub/${1}/DbPassword --with-decryption | jq .Parameter.Value | sed -e "s/\"//g"`)

# This is intended to be run during the AWS CodeBuild process to migrate new database changes
for i in *.sql; do
  [ -f "$i" ] || break
  echo "Found a database migration file: ${i} ..."
  echo "mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < $i"
  mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < $i
done
