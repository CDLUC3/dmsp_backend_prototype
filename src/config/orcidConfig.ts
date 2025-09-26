import { verifyCriticalEnvVariable } from "../utils/helpers";

// Verify these critical variables on startup!
verifyCriticalEnvVariable('ORCID_CLIENT_ID');
verifyCriticalEnvVariable('ORCID_CLIENT_SECRET');

export const OrcidConfig = {
  clientId: process.env.ORCID_CLIENT_ID,
  clientSecret: process.env.ORCID_CLIENT_SECRET,

  baseUrl: process.env.ORCID_BASE_URL ?? 'https://pub.sandbox.orcid.org',
  authPath: process.env.ORCID_AUTH_PATH ?? '/oauth/token',
  apiPath: process.env.ORCID_API_PATH ?? '/v3.0/',

  readOnlyScope: process.env.ORCID_READ_ONLY_SCOPE ?? '/read-public',
}
