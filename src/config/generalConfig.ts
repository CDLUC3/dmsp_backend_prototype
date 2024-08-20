import { verifyCriticalEnvVariable } from "../utils/helpers";

verifyCriticalEnvVariable('JWT_SECRET');

export const generalConfig = {
  restDataSourceCacheTtl: process.env.REST_DATA_SOURCE_CACHE_TTL,

  jwtSecret: process.env.JWT_SECRET,
  jwtTtl: process.env.JWT_TTL || '1hr',
}