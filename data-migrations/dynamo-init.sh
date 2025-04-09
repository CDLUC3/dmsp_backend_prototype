
CREATE_TABLE="aws dynamodb create-table
  --endpoint-url http://dynamodb:8000
  --table-name localDMPTable
  --attribute-definitions [{\"AttributeName\":\"PK\",\"AttributeType\":\"S\"},{\"AttributeName\":\"SK\",\"AttributeType\":\"S\"}]
  --key-schema [{\"AttributeName\":\"PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"SK\",\"KeyType\":\"RANGE\"}]
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
  --region us-west-2"

echo "Creating DynamoDB table..."
$CREATE_TABLE
