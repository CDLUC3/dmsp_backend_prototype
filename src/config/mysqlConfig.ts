import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from "../utils/helpers";
import { PoolConfig } from '../datasources/mySQLDataSource';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  verifyCriticalEnvVariable('MYSQL_HOST');
  verifyCriticalEnvVariable('MYSQL_USER');
  verifyCriticalEnvVariable('MYSQL_PASSWORD');
}

export const mysqlConfig: PoolConfig = {
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 5,
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE || 'dmsp',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};
