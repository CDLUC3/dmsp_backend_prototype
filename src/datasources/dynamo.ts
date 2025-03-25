import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { awsConfig } from "../config/awsConfig";
import { logger } from "../logger";
import { DMPCommonStandard } from "../types/DMP";
import { generalConfig } from "../config/generalConfig";

const DMP_PK_PREFIX = 'DMP';
const DMP_SK_PREFIX = 'VERSION';
const DMP_LATEST_VERSION = 'latest';
const DMP_TOMBSTONE_VERSION = 'tombstone';

// Initialize AWS SDK clients (outside the handler function)
const dynamoDBClient = new DynamoDBClient({
  region: awsConfig.region,
  maxAttempts: awsConfig.dynamoMaxQueryAttempts,
  logger: logger,
});

export class dynamo {
  // Fetch the specified DMP metadata record
  //   - Version is optional, if not provided ALL versions of the DMP will be returned
  //   - If you just want the latest version, use the DMP_LATEST_VERSION constant
  static getDMP = async (dmpId: string, version: string | null): Promise<DMPCommonStandard[] | []> => {
    const params = {
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: dynamo.dmpIdToPK(dmpId) },
      }
    };

    if (version) {
      params.ExpressionAttributeValues[":sk"] = { S: dynamo.versionToSK(version) };
    }

    const response = await dynamo.queryTable(awsConfig.dynamoTableName, params);
    if (response && response.Items.length === 0) {
      // sort the the results by the SK (version) descending
      const items = response.Items.sort((a, b) => b.SK.toString().localeCompare(a.SK.toString()));
      return items.map((item) => unmarshall(item) as DMPCommonStandard);
    }
    return [];
  }

  // Create a new DMP metadata record
  //  - Version is optional, if not provided the latest version will be created
  static createDMP = async (
    dmpId: string,
    dmp: DMPCommonStandard,
    version = DMP_LATEST_VERSION
  ): Promise<DMPCommonStandard | null> => {
    // Set the DynamoDB Partition Key (PK) and Sort Key (SK)
    dmp['PK'] = dynamo.dmpIdToPK(dmpId);
    dmp['SK'] = dynamo.versionToSK(version);

    // if the version is LATEST, then first make sure there is not already a latest version!
    if (version === DMP_LATEST_VERSION) {
      const existing = await dynamo.getDMP(dmpId, DMP_LATEST_VERSION);
      if (!existing) {
        logger.error({ dmpId, version }, 'Error creating DMP: Latest version of DMP already exists');
        return null;
      }
    }

    const now = new Date().toISOString()
    // If the version is LATEST, then this is the first version of the DMP so set the created timestamp
    if (version === DMP_LATEST_VERSION) {
      dmp.created = now;
    }
    dmp.modified = now;
    // Set the provenance ID
    dmp.dmphub_provenance_id = generalConfig.applicationName.toLowerCase();

    const response = await dynamo.putItem(awsConfig.dynamoTableName, marshall(dmp, { removeUndefinedValues: true }));
    if (response) {
      // If the create was successful, fetch the new entry and return it
      const newDMP = await dynamo.getDMP(dmpId, DMP_LATEST_VERSION);
      if (newDMP && newDMP.length > 0) {
        return newDMP[0];
      }
    }
    return null;
  }

  // Update the specified DMP metadata record
  static updateDMP = async (dmp: DMPCommonStandard): Promise<DMPCommonStandard | null> => {
    dmp['PK'] = dynamo.dmpIdToPK(dmp.dmp_id?.identifier);
    // Updates can only ever occur on the latest version of the DMP (the Plan logic should handle creating
    // a snapshot of the original version of the DMP when appropriate)
    dmp['SK'] = dynamo.versionToSK(DMP_LATEST_VERSION);

    const response = await dynamo.putItem(awsConfig.dynamoTableName, marshall(dmp, { removeUndefinedValues: true }));
    if (response) {
      // If the update was successful, fetch the updated entry and return it
      const updated = await dynamo.getDMP(dmp.dmp_id?.identifier, DMP_LATEST_VERSION);
      return Array.isArray(updated) ? updated[0] : null;
    }
    return null;
  }

  // Tombstone the specified DMP metadata record (registered/published DMPs only!)
  static tombstoneDMP = async (dmpId: string): Promise<DMPCommonStandard> => {
    const dmps = await dynamo.getDMP(dmpId, DMP_LATEST_VERSION);
    if (dmps && dmps.length !== 0) {
      const dmp = dmps[0];

      // Set the tombstone version and title
      dmp['SK'] = DMP_TOMBSTONE_VERSION;
      dmp.title = `OBSOLETE: ${dmp.title}`;
      // Set the modified and tombstoned timestamps
      const now = new Date().toISOString();
      dmp.modified = now;
      dmp.tombstoned = now;

      const response = await dynamo.putItem(awsConfig.dynamoTableName, marshall(dmp, { removeUndefinedValues: true }));
      if (response) {
        return dmp;
      }
    }
    return null;
  }

  // Delete the specified DMP metadata record (NON registered/published DMPs only!)
  static deleteDMP = async (dmpId): Promise<void> => {
    await dynamo.deleteItem(awsConfig.dynamoTableName, {
      PK: { S: dynamo.dmpIdToPK(dmpId) }, SK: { S: dynamo.versionToSK(null) }
    });
  }

  // Scan the specified DynamoDB table using the specified criteria
  static scanTable = async (table: string, params: object): Promise<Record<string, AttributeValue>[] | undefined> => {
    let items = [];
    let lastEvaluatedKey;

    // Query the DynamoDB index table for all DMP metadata (with pagination)
    do {
      const command = new ScanCommand({
        TableName: table,
        ExclusiveStartKey: lastEvaluatedKey,
        ConsistentRead: false,
        ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
        ...params
      });
      const response = await dynamoDBClient.send(command);

      // Collect items and update the pagination key
      items = items.concat(response?.Items || []);
      // LastEvaluatedKey is the position of the end cursor from the query that was just run
      // when it is undefined, then the query reached the end of the results.
      lastEvaluatedKey = response?.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Deserialize and split items into multiple files if necessary
    return items;
  }

  // Query the specified DynamoDB table using the specified criteria
  static queryTable = async (table: string, params: object = {}): Promise<QueryCommandOutput> => {
    try {
      // Query the DynamoDB index table for all DMP metadata (with pagination)
      const command = new QueryCommand({
        TableName: table,
        ConsistentRead: false,
        ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
        ...params
      });
      return await dynamoDBClient.send(command);
    } catch (err) {
      logger.error({ table, err, params }, `Error querying DynamoDB table: ${table}`);
      throw new Error('Unable to query DynamoDB table');
    }
  }

  // Put and item into the specified DynamoDB table
  static putItem = async (table: string, item: Record<string, NativeAttributeValue>): Promise<PutItemCommandOutput> => {
    try {
      // Put the item into the DynamoDB table
      return await dynamoDBClient.send(new PutItemCommand({
        TableName: table,
        ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
        Item: item
      }));
    } catch (err) {
      logger.error({ table, err, item }, `Error putting item into DynamoDB table: ${table}`);
      throw new Error('Unable to put item into DynamoDB table');
    }
  }

  // Delete an item from the specified DynamoDB table
  static deleteItem = async (table: string, key: Record<string, AttributeValue>): Promise<void> => {
    try {
      // Delete the item from the DynamoDB table
      await dynamoDBClient.send(new DeleteItemCommand({
        TableName: table,
        ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
        Key: key
      }));
    } catch (err) {
      logger.error({ table, err, key }, `Error deleting item from DynamoDB table: ${table}`);
      throw new Error('Unable to delete item from DynamoDB table');
    }
  }

  // Function to convert a DMP ID into a PK for the DynamoDB table
  static dmpIdToPK = (dmpId: string): string => {
    // Remove the protocol and slashes from the DMP ID
    const id = dmpId.replace(/(^\w+:|^)\/\//, '');
    return `${DMP_PK_PREFIX}#${id}`;
  }

  // Function to convert a DMP ID version timestamp into a SK for the DynamoDB table
  static versionToSK = (version = DMP_LATEST_VERSION): string => {
    return `${DMP_SK_PREFIX}#${version}`;
  }
}