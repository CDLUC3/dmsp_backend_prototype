import { verifyCriticalEnvVariable } from "../utils/helpers";

verifyCriticalEnvVariable('JWT_SECRET');

export const generalConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtTtl: process.env.JWT_TTL || '1hr',
}