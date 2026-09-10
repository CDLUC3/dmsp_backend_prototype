import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from '../utils/helpers.js';
import { DynamoConnectionParams } from "@dmptool/utils";
import { Logger } from "pino";

dotenv.config();

if (!['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
  verifyCriticalEnvVariable(process.env.SES_ENDPOINT, 'SES_ENDPOINT');
  verifyCriticalEnvVariable(process.env.SES_ACCESS_ID, 'SES_ACCESS_ID');
  verifyCriticalEnvVariable(process.env.SES_ACCESS_SECRET, 'SES_ACCESS_SECRET');
  verifyCriticalEnvVariable(process.env.SES_BOUNCE_EMAIL_ADDRESS, 'SES_BOUNCE_EMAIL_ADDRESS');
  verifyCriticalEnvVariable(process.env.SES_BOUNCED_EMAIL_BUCKET, 'SES_BOUNCED_EMAIL_BUCKET');
  verifyCriticalEnvVariable(process.env.DYNAMO_TABLE_NAME, 'DYNAMO_TABLE_NAME');

  verifyCriticalEnvVariable(process.env.OPENSEARCH_HOST, 'OPENSEARCH_HOST');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_PORT, 'OPENSEARCH_PORT');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_USE_SSL, 'OPENSEARCH_USE_SSL');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_VERIFY_CERTS, 'OPENSEARCH_VERIFY_CERTS');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_AUTH_TYPE, 'OPENSEARCH_AUTH_TYPE');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_REGION, 'OPENSEARCH_REGION');
  verifyCriticalEnvVariable(process.env.OPENSEARCH_SERVICE, 'OPENSEARCH_SERVICE');
}

export const awsConfig = {
  // Basic AWS config
  region: process.env.AWS_REGION || 'us-west-2',

  // Simple Email Service (SES) configuration
  ses: {
    endpoint: process.env.SES_ENDPOINT,
    port: process.env.SES_PORT ?? 465,
    accessKey: process.env.SES_ACCESS_ID,
    accessSecret: process.env.SES_ACCESS_SECRET,
    bounceAddress: process.env.SES_BOUNCE_EMAIL_ADDRESS,
    bouncedEmailBucket: process.env.SES_BOUNCED_EMAIL_BUCKET,
  },

  // S3 cloudfront/CDN bucket configuration
  s3: {
    bucket: process.env.S3_BUCKET || 'maDMPs',
    localstackPort: process.env.LOCALSTACK_PORT,
  },

  // SQS configuration
  dynamo: {
    region: process.env.AWS_REGION || 'us-west-2',
    tableName: process.env.DYNAMO_TABLE_NAME || 'maDMPs',
    endpoint: process.env.DYNAMO_ENDPOINT,
    maxAttempts: Number(process.env.DYNAMO_MAX_ATTEMPTS) || 3,
  },

  // OpenSearch config
  opensearch: {
    host: process.env.OPENSEARCH_HOST || 'host.docker.internal',
    port: Number.parseInt(process.env.OPENSEARCH_PORT || '9200', 10),
    useSSL: process.env.OPENSEARCH_USE_SSL === 'true', // true or false
    verifyCerts: process.env.OPENSEARCH_VERIFY_CERTS === 'true', // true or false
    authType: process.env.OPENSEARCH_AUTH_TYPE || null, // aws or basic
    username: process.env.OPENSEARCH_USERNAME || null,
    password: process.env.OPENSEARCH_PASSWORD || null,
    awsRegion: process.env.OPENSEARCH_REGION || null,
    awsService: process.env.OPENSEARCH_SERVICE || null,
  },

  opensearchServerless: {
    node: process.env.OPENSEARCH_SERVERLESS_NODE || 'https://host.docker.internal:9200',
  }
}

/**
 * Get the connection parameters for the MySQL database. (needed by @dmptool/utils)
 *
 * @param logger The Pino logger
 * @returns The connection parameters
 */
export const getDynamoConnectionParams = (logger: Logger): DynamoConnectionParams => {
  return {
    logger,
    ...awsConfig.dynamo
  };
};
