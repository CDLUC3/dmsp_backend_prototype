import { dynamoDBTables, DynamoDBSource } from '../data-sources/DynamoDBSource.js';

interface DMSP {
  PK: string;
  SK: string;
  title: string;
  modified: string;
  created: string;
  // ... other fields
}

// Swap these out if you are not using AWS DynamoDB for your DMSP metadata
const dmpDBService = new DynamoDBSource(dynamoDBTables.DMSPs);

const DMSPResolver = {
  Query: {
    // Get the DMSP
    getDMSP: async (_: any, { PK, SK }: { PK: string, SK: string }): Promise<DMSP | null> => {
      SK = SK == undefined ? 'VERSION#latest' : SK
      const item = await dmpDBService.getItem({ PK: PK, SK: SK });
      return item as DMSP;
    },
  },
};

export default DMSPResolver;
