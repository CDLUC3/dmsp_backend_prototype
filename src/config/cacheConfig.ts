import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from "../utils/helpers";

dotenv.config();

verifyCriticalEnvVariable('CACHE_HOST');
verifyCriticalEnvVariable('CACHE_PORT');

const host = process.env.CACHE_HOST;
const port = Number.parseInt(process.env.CACHE_PORT);
const connectTimeout = Number.parseInt(process.env.CACHE_CONNECT_TIMEOUT) || 30000; // 30 seconds

let cache = {};
if (process.env.NODE_ENV !== 'development') {
  cache = { host, port, connectTimeout, tls: {} };
} else {
  cache = { host, port, connectTimeout };
}

export const cacheConfig = cache;

export const cacheTLS = `rediss://${host}:${port}`;
