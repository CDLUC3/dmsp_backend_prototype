# SECRET_RESPONSE=$(aws secretsmanager get-secret-value --secret-id ${SECRETS_MANAGER_ARN})

# HOST=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .host)
HOST=$(aws ssm get-parameter --name /uc3/dmp/hub/$1/DbHost | jq -r .Parameter.Value)
PORT=$(aws ssm get-parameter --name /uc3/dmp/hub/$1/DbPort | jq -r .Parameter.Value)
DB=$(aws ssm get-parameter --name /uc3/dmp/hub/$1/DbName | jq -r .Parameter.Value)
USER=$(aws ssm get-parameter --name /uc3/dmp/hub/$1/DbUsername | jq -r .Parameter.Value)
PASSWORD=$(aws ssm get-parameter --name /uc3/dmp/hub/$1/DbPassword | jq -r .Parameter.Value)

for i in *.sql; do
  [ -f "$i" ] || break
  echo "Found a migration file: ${i} ..."
  echo "PGPASSWORD=${PASSWORD} psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -a -f ${i}"
  echo $(which psql)
  $(PGPASSWORD=${PASSWORD} psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -a -f ${i})
done
