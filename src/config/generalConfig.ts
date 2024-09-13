import { verifyCriticalEnvVariable } from "../utils/helpers";

// Verify these critical variables on startup!
verifyCriticalEnvVariable('JWT_SECRET');
verifyCriticalEnvVariable('JWT_REFRESH_SECRET');

export const generalConfig = {
  restDataSourceCacheTtl: process.env.REST_DATA_SOURCE_CACHE_TTL,

  jwtSecret: process.env.JWT_SECRET,
  jwtTTL: Number.parseInt(process.env.JWT_TTL) || 10, // Default is 10 minutes
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshTTL: Number.parseInt(process.env.JWT_REFRESH_TTL) || 86400, // Default is 1 day
}