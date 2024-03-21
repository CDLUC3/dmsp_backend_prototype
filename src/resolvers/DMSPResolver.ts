import { Dmsp } from '../data-models/Dmsp.js'
import { dynamoDBTables, DynamoDBSource } from '../data-sources/DynamoDBSource.js';

// Swap these out if you are not using AWS DynamoDB for your DMSP metadata
const dmpDBService = new DynamoDBSource(dynamoDBTables.DMSPs);

const DmspResolver = {
  Query: {
    // Get the DMSP
    getDMSP: async (_: any, { PK, SK }: { PK: string, SK: string }): Promise<Dmsp | null> => {
      SK = SK == undefined ? 'VERSION#latest' : SK
      const item = await dmpDBService.getItem({ PK: PK, SK: SK });
      return item as Dmsp;
    },
  },
};

export default DmspResolver;
