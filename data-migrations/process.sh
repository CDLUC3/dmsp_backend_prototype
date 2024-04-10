# SECRET_RESPONSE=$(aws secretsmanager get-secret-value --secret-id ${SECRETS_MANAGER_ARN})

# HOST=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .host)
HOST=$(echo aws ssm get-parameter --name /uc3/dmp/hub/dev/DbHost | jq -r .Parameter.Value )
PORT=$(echo aws ssm get-parameter --name /uc3/dmp/hub/dev/DbPort | jq -r .Parameter.Value )
DB=$(echo aws ssm get-parameter --name /uc3/dmp/hub/dev/DbName | jq -r .Parameter.Value )
USER=$(echo aws ssm get-parameter --name /uc3/dmp/hub/dev/DbUsername | jq -r .Parameter.Value )
PASSWORD=$(echo aws ssm get-parameter --name /uc3/dmp/hub/dev/DbPassword | jq -r .Parameter.Value )

for i in *.sql; do
  [ -f "$i" ] || break
  echo "Found a migration file: ${i} ..."
  echo "PGPASSWORD=${PASSWORD} psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -a -f ${i}"
  echo $(which psql)
  $(PGPASSWORD=${PASSWORD} psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -a -f ${i})
done
