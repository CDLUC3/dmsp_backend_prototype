import * as dotenv from 'dotenv';
import { PoolConfig } from './datasources/mysqlDB';

dotenv.config();

export const mysqlConfig: PoolConfig = {
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};
