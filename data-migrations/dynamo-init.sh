
CREATE_TABLE="aws dynamodb create-table
  --endpoint-url http://dynamodb:8000
  --attribute-definitions [{\"AttributeName\":\"PK\",\"AttributeType\":\"S\"},{\"AttributeName\":\"SK\",\"AttributeType\":\"S\"}]
  --key-schema [{\"AttributeName\":\"PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"SK\",\"KeyType\":\"RANGE\"}]
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
  --region us-west-2
  --no-cli-pager"

echo "Creating DynamoDB tables $DYNAMO_TABLE_NAME and $DYNAMO_TEST_TABLE_NAME ..."
$CREATE_TABLE --table-name $DYNAMO_TABLE_NAME

$CREATE_TABLE --table-name $DYNAMO_TEST_TABLE_NAME
