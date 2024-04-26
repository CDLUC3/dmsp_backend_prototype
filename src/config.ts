import * as dotenv from 'dotenv';
import { pgConfig } from './datasources/postgresDB';
import { PoolConfig } from './datasources/mysqlDB';

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

export const mysqlConfig: PoolConfig = {
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};
