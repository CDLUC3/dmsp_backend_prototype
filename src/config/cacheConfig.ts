import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from "../utils/helpers";

dotenv.config();

verifyCriticalEnvVariable('CACHE_HOST');
verifyCriticalEnvVariable('CACHE_PORT');

export const cacheConfig = {
  cluster: [{
    host: process.env.CACHE_HOST,
    port: Number.parseInt(process.env.CACHE_PORT),
  }],
  connectTimeout: Number.parseInt(process.env.CACHE_CONNECT_TIMEOUT) || 10000, // 10 seconds
};
