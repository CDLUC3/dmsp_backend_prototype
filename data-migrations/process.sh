SECRET_RESPONSE=$(aws secretsmanager get-secret-value --secret-id ${SECRETS_MANAGER_ARN})

HOST=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .host)
PORT=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .port)
DB=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .dbname)
USER=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .username)
PASSWORD=$(echo $SECRET_RESPONSE | jq '.SecretString | fromjson' | jq -r .password)

for i in *.sql; do
  [ -f "$i" ] || break
  echo "Found a migration file: ${i} ..."
  $(PGPASSWORD=${PASSWORD} psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -a -f ${i})
done
