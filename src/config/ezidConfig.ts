import { verifyCriticalEnvVariable } from "../utils/helpers.js";

// Verify these critical variables on startup!
verifyCriticalEnvVariable(process.env.EZID_USERNAME, 'EZID_USERNAME');
verifyCriticalEnvVariable(process.env.EZID_PASSWORD, 'EZID_PASSWORD');

export const EZIDConfig = {
  baseApiUrl: process.env.EZID_API_URL ?? 'https://ezid-stg.cdlib.org/',
  username: process.env.EZID_USERNAME,
  password: process.env.EZID_PASSWORD,
}
