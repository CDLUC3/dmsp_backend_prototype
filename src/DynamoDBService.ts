import * as dotenv from 'dotenv';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client.js';
import AWS from './awsConfig.js';

// Pull in the environment variables from either the .env file or the ENV variables
dotenv.config();

interface Key {
  PK: string;
  SK: string;
}

// Establish the DynamoDB Table names based on the environment
export const dynamoDBTables = {
  dmps: process.env.DMPS_TABLE !== undefined ? process.env.DMPS_TABLE : 'dmps-local',
}

// Generic DynamoDB service. The caller defines which table when initializing the service
export class DynamoDBService {
  private dynamoDB: DocumentClient;
  private tableName: string;

  constructor(tableName: string) {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  async getItem(params: Key): Promise<any> {
    try {
      const { Item } = await this.dynamoDB.get({ TableName: this.tableName, Key: params }).promise();
      return Item;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.name) {
          case 'ResourceNotFoundException':
            throw new Error('Item not found');
          default:
            console.error('Error fetching item from DynamoDB:', error);
            throw new Error('Error fetching item from DynamoDB');
        }
      } else {
        console.log(error);
      }
    }
  }
}
