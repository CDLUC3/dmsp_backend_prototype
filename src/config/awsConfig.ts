import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from '../utils/helpers';

dotenv.config();

if (!['development', 'test'].includes(process.env.NODE_ENV)) {
  verifyCriticalEnvVariable('SES_ENDPOINT');
  verifyCriticalEnvVariable('SES_ACCESS_ID');
  verifyCriticalEnvVariable('SES_ACCESS_SECRET');
  verifyCriticalEnvVariable('SES_BOUNCE_EMAIL_ADDRESS');
  verifyCriticalEnvVariable('SES_BOUNCED_EMAIL_BUCKET');
  verifyCriticalEnvVariable('DYNAMO_TABLE_NAME');
}

export const awsConfig = {
  // Basic AWS config
  region: process.env.AWS_REGION || 'us-west-2',

  // Simple Email Service (SES) configuration
  sesEndpoint: process.env.SES_ENDPOINT,
  port: process.env.SES_PORT ?? 465,
  sesAccessKey: process.env.SES_ACCESS_ID,
  sesAccessSecret: process.env.SES_ACCESS_SECRET,
  sesBounceAddress: process.env.SES_BOUNCE_EMAIL_ADDRESS,
  sesBouncedEmailBucket: process.env.SES_BOUNCED_EMAIL_BUCKET,

  // DynamoDB configuration
  dynamoTableName: process.env.DYNAMO_TABLE_NAME,
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  dynamoMaxQueryAttempts: process.env.DYNAMO_MAX_ATTEMPTS ? parseInt(process.env.DYNAMO_MAX_ATTEMPTS) : 3,
}
