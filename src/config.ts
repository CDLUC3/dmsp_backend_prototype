import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { pgConfig } from './datasources/postgresDB';

dotenv.config();

// Relational DB configuration
export const postgresConfig: pgConfig = {
  max: Number(process.env.POSTGRES_POOL_SIZE),
  idleTimeoutMillis: Number(process.env.POSTGRESS_IDLE_TIMEOUT),
  connectionTimeoutMillis: Number(process.env.POSTGRES_CONNECTION_TIMEOUT),
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
  region: process.env.AWS_REGION,
  // accessKeyId: 'your-access-key-id',
  // secretAccessKey: 'your-secret-access-key',
});
export const aws = AWS;