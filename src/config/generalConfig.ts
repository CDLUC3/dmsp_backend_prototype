import { verifyCriticalEnvVariable } from "../utils/helpers";

// Verify these critical variables on startup!
verifyCriticalEnvVariable('DOMAIN');
verifyCriticalEnvVariable('APP_NAME');
verifyCriticalEnvVariable('DEFAULT_AFFILIATION_URI');
verifyCriticalEnvVariable('TOKEN_HASH_SECRET');
verifyCriticalEnvVariable('JWT_SECRET');
verifyCriticalEnvVariable('JWT_REFRESH_SECRET');

export const generalConfig = {
  restDataSourceCacheTtl: Number.parseInt(process.env.REST_DATA_SOURCE_CACHE_TTL) || 180,

  domain: process.env.DOMAIN,
  applicationName: process.env.APP_NAME,
  defaultAffiliatioURI: process.env.DEFAULT_AFFILIATION_URI,

  bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,

  hashTokenSecret: process.env.TOKEN_HASH_SECRET,

  jwtSecret: process.env.JWT_SECRET,
  jwtTTL: Number.parseInt(process.env.JWT_TTL) || 1800000, // Default is 30 minutes (in milliseconds)
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshTTL: Number.parseInt(process.env.JWT_REFRESH_TTL) || 86400000, // Default is 24 hours (in milliseconds)

  csrfLength: Number.parseInt(process.env.CSRF_LENGTH) || 32,
  csrfTTL: Number.parseInt(process.env.CSRF_TTL) || 3600 // Default is 1 hour
}