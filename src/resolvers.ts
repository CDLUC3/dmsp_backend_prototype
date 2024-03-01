import { dynamoDBTables, DynamoDBService } from './DynamoDBService.js';

interface DMP {
  PK: string;
  SK: string;
  title: string;
  modified: string;
  created: string;
  // ... other fields
}

interface DMPKey {
  PK: string;
  SK: string;
}

const dmpDBService = new DynamoDBService(dynamoDBTables.dmps); // Replace with your actual DynamoDB table name

const resolvers = {
  Query: {
    // Get the DMSP
    getDMP: async (_: any, { PK, SK }: { PK: string, SK: string }): Promise<DMP | null> => {
      SK = SK == undefined ? 'VERSION#latest' : SK
      const item = await dmpDBService.getItem({ PK: PK, SK: SK });
      return item as DMP;
    },
  },
};

export default resolvers;
