import { User } from '../data-models/User.js'
import { dynamoDBTables, DynamoDBSource } from '../data-sources/DynamoDBSource.js';

// Swap these out if you are not using AWS DynamoDB for your DMSP metadata
const dmpDBService = new DynamoDBSource(dynamoDBTables.DMSPs);

const UserResolver = {
  Query: {
    getUser: (parent: any, args: any, contextValue: any) => {
      if (!contextValue.token) return null;

      return User.getByToken(contextValue.token);
    },
  },
};

export default UserResolver;
