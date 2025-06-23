import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { awsConfig } from "../config/awsConfig";
import { formatLogMessage, logger } from "../logger";
import { DMPCommonStandard } from "../types/DMP";
import { generalConfig } from "../config/generalConfig";
import { MyContext } from "../context";
import { isNullOrUndefined } from "../utils/helpers";

const DMP_PK_PREFIX = 'DMP';
const DMP_SK_PREFIX = 'VERSION';
const DMP_LATEST_VERSION = 'latest';
const DMP_TOMBSTONE_VERSION = 'tombstone';

export const dynamoEnabled = !isNullOrUndefined(awsConfig.dynamoTableName);

const dynamoConfigParams: DynamoDBClientConfig = {
  region: awsConfig.region,
  maxAttempts: awsConfig.dynamoMaxQueryAttempts,
  logger: logger,
}

if (['development', 'test'].includes(process.env.NODE_ENV)) {
  dynamoConfigParams.endpoint = awsConfig.dynamoEndpoint;
}

// Initialize AWS SDK clients (outside the handler function)
const dynamoDBClient = new DynamoDBClient(dynamoConfigParams);

export interface dynamoInterface {
  getDMP: (dmpId: string, version: string | null) => Promise<DMPCommonStandard[] | []>;
  createDMP: (dmpId: string, dmp: DMPCommonStandard, version?: string) => Promise<DMPCommonStandard | null>;
  updateDMP: (dmp: DMPCommonStandard) => Promise<DMPCommonStandard | null>;
  tombstoneDMP: (dmpId: string) => Promise<DMPCommonStandard>;
  deleteDMP: (dmpId: string) => Promise<void>;
}

// Lightweight query just to check if the DMP exists
export const DMPExists = async (context: MyContext, dmpId: string): Promise<boolean> => {
  // Very lightweight here, just returning a PK if successful
  const params = {
    KeyConditionExpression: "PK = :pk AND SK = :sk",
    ExpressionAttributeValues: {
      ":pk": { S: dmpIdToPK(dmpId) },
      ":sk": { S: versionToSK(DMP_LATEST_VERSION) }
    },
    ProjectExpression: "PK"
  }

  try {
    const response = await queryTable(context, awsConfig.dynamoTableName, params);
    return response && response.Items.length > 0;
  } catch (err) {
    formatLogMessage(context).error(params, 'Error checking DynamoDB for DMP existence');
    return false;
  }
}

// Fetch the specified DMP metadata record
//   - Version is optional, if not provided ALL versions of the DMP will be returned
//   - If you just want the latest version, use the DMP_LATEST_VERSION constant
export const getDMP = async (
  context: MyContext,
  dmpId: string,
  version: string | null
): Promise<DMPCommonStandard[] | []> => {
  let params = {};

  if (version) {
    params = {
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: dmpIdToPK(dmpId) },
        ":sk": { S: versionToSK(version) }
      }
    }
  } else {
    params = {
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: dmpIdToPK(dmpId) }
      }
    }
  }

  try {
    const response = await queryTable(context, awsConfig.dynamoTableName, params);
    if (response && response.Items.length > 0) {
      // sort the the results by the SK (version) descending
      const items = response.Items.sort((a, b) => b?.SK?.S?.toString().localeCompare(a?.SK?.S?.toString()));
      return items.map((item) => {
        // Unmarshall the item and remove the PK and SK because they're only important to DynamoDB
        const unmarshalled = unmarshall(item);
        delete unmarshalled.PK;
        delete unmarshalled.SK;
        return unmarshalled as DMPCommonStandard;
      });
    }
  } catch (err) {
    formatLogMessage(context).error({ dmpId, version }, 'Error getting DMP');
    throw(err);
  }
  return [];
}

  // Create a new DMP metadata record
  //  - Version is optional, if not provided the latest version will be created
export const createDMP = async (
  context: MyContext,
  dmpId: string,
  dmp: DMPCommonStandard,
  version = DMP_LATEST_VERSION
): Promise<DMPCommonStandard | null> => {
  // Set the DynamoDB Partition Key (PK) and Sort Key (SK)
  dmp['PK'] = dmpIdToPK(dmpId);
  dmp['SK'] = versionToSK(version);

  // if the version is LATEST, then first make sure there is not already a latest version!
  if (version === DMP_LATEST_VERSION) {
    const existing = await getDMP(context, dmpId, DMP_LATEST_VERSION);
    if (!Array.isArray(existing) || existing.length > 0) {
      formatLogMessage(context).error({ dmpId, version }, 'Error creating DMP: Latest version already exists');
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

  try {
    const marshalled = marshall(dmp, { removeUndefinedValues: true });

    const response = await putItem(context, awsConfig.dynamoTableName, marshalled);
    if (response) {
      // If the create was successful, fetch the new entry and return it
      const newDMP = await getDMP(context, dmpId, DMP_LATEST_VERSION);
      if (newDMP && newDMP.length > 0) {
        return newDMP[0];
      }
    }
  } catch (err) {
    formatLogMessage(context).error({ dmpId, dmp, version, err }, 'Error creating DMP');
    throw(err);
  }
  return null;
}

// Update the specified DMP metadata record
export const updateDMP = async (
  context: MyContext,
  dmp: DMPCommonStandard
): Promise<DMPCommonStandard | null> => {
  dmp['PK'] = dmpIdToPK(dmp.dmp_id?.identifier);
  // Updates can only ever occur on the latest version of the DMP (the Plan logic should handle creating
  // a snapshot of the original version of the DMP when appropriate)
  dmp['SK'] = versionToSK(DMP_LATEST_VERSION);

  try {
    const marshalled = marshall(dmp, { removeUndefinedValues: true });
    const response = await putItem(context, awsConfig.dynamoTableName, marshalled);
    if (response) {
      // If the update was successful, fetch the updated entry and return it
      const updated = await getDMP(context, dmp.dmp_id?.identifier, DMP_LATEST_VERSION);
      return Array.isArray(updated) && updated.length > 0 ? updated[0] : null;
    }
  } catch (err) {
    formatLogMessage(context).error({ dmp }, 'Error updating DMP for DynamoDB');
    throw(err);
  }
  return null;
}

// Tombstone the specified DMP metadata record (registered/published DMPs only!)
export const tombstoneDMP = async (context: MyContext, dmpId: string): Promise<DMPCommonStandard> => {
  const dmps = await getDMP(context, dmpId, DMP_LATEST_VERSION);
  if (dmps && dmps.length !== 0) {
    const dmp = dmps[0];

    // Set the tombstone version and title
    dmp['SK'] = DMP_TOMBSTONE_VERSION;
    dmp.title = `OBSOLETE: ${dmp.title}`;
    // Set the modified and tombstoned timestamps
    const now = new Date().toISOString();
    dmp.modified = now;
    dmp.tombstoned = now;

    try {
      const marshalled = marshall(dmp, { removeUndefinedValues: true });
      const response = await putItem(context, awsConfig.dynamoTableName, marshalled);
      if (response) {
        return dmp;
      }
    } catch (err) {
      formatLogMessage(context).error({ dmpId}, 'Error tombstoning DMP in DynamoDB');
      throw(err);
    }
  }
  return null;
}

// Delete the specified DMP metadata record (NON registered/published DMPs only!)
export const deleteDMP = async (context: MyContext, dmpId: string): Promise<void> => {
  // Get all of the versions of the DMP
  try {
    const dmps = await getDMP(context, dmpId, DMP_LATEST_VERSION);

    if (Array.isArray(dmps) && dmps.length > 0 && dmps[0]['SK'] !== DMP_TOMBSTONE_VERSION) {
      for (const dmp of dmps) {
        // Delete each version of the DMP
        await deleteItem(context, awsConfig.dynamoTableName, {
          PK: { S: dmpIdToPK(dmpId) }, SK: { S: versionToSK(dmp.modified) }
        });
      }
    }
  } catch (err) {
    formatLogMessage(context).error({ dmpId }, 'Error deleting DMP from DynamoDB');
    throw(err);
  }
}

  // Scan the specified DynamoDB table using the specified criteria
 export const scanTable = async (
  context: MyContext,
  table: string,
  params: object
): Promise<Record<string, AttributeValue>[] | undefined> => {
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

    formatLogMessage(context).debug({ table, params }, 'Scanning DynamoDB');
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
export const queryTable = async (
  context: MyContext,
  table: string,
  params: object = {}
): Promise<QueryCommandOutput> => {
  try {
    // Query the DynamoDB index table for all DMP metadata (with pagination)
    const command = new QueryCommand({
      TableName: table,
      ConsistentRead: false,
      ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
      ...params
    });

    formatLogMessage(context).debug({ table, params }, 'Querying DynamoDB');
    return await dynamoDBClient.send(command);
  } catch (err) {
    logger.error({ table, err, params }, `Error querying DynamoDB table: ${table}`);
    throw new Error('Unable to query DynamoDB table');
  }
}

// Put and item into the specified DynamoDB table
export const putItem = async (
  context: MyContext,
  table: string,
  item: Record<string, NativeAttributeValue>
): Promise<PutItemCommandOutput> => {
  try {
    // Put the item into the DynamoDB table
    formatLogMessage(context).debug({ table, item }, 'Putting item into DynamoDB');
    return await dynamoDBClient.send(new PutItemCommand({
      TableName: table,
      ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
      Item: item
    }));
  } catch (err) {
    formatLogMessage(context).error({ table, item, err }, 'Error putting item into DynamoDB');
    throw new Error('Unable to put item into DynamoDB table');
  }
}

// Delete an item from the specified DynamoDB table
export const deleteItem = async (
  context: MyContext,
  table: string,
  key: Record<string, AttributeValue>
): Promise<void> => {
  try {
    // Delete the item from the DynamoDB table
    formatLogMessage(context).debug({ table, key }, 'Deleting item from DynamoDB');
    await dynamoDBClient.send(new DeleteItemCommand({
      TableName: table,
      ReturnConsumedCapacity: logger?.level === 'debug' ? 'TOTAL' : 'NONE',
      Key: key
    }));
  } catch (err) {
    formatLogMessage(context).error({ table, key, err }, 'Error deleting item from DynamoDB');
    throw new Error('Unable to delete item from DynamoDB table');
  }
}

// Function to convert a DMP ID into a PK for the DynamoDB table
const dmpIdToPK = (dmpId: string): string => {
  // Remove the protocol and slashes from the DMP ID
  const id = dmpId?.replace(/(^\w+:|^)\/\//, '');
  return `${DMP_PK_PREFIX}#${id}`;
}

// Function to convert a DMP ID version timestamp into a SK for the DynamoDB table
const versionToSK = (version = DMP_LATEST_VERSION): string => {
  return `${DMP_SK_PREFIX}#${version}`;
}
