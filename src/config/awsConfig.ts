import * as dotenv from 'dotenv';
import { verifyCriticalEnvVariable } from '../utils/helpers';

dotenv.config();

if (!['development', 'test'].includes(process.env.NODE_ENV)) {
  verifyCriticalEnvVariable('SES_ENDPOINT');
  verifyCriticalEnvVariable('SES_ACCESS_ID');
  verifyCriticalEnvVariable('SES_ACCESS_SECRET');
  verifyCriticalEnvVariable('SES_BOUNCE_EMAIL_ADDRESS');
  verifyCriticalEnvVariable('SES_BOUNCED_EMAIL_BUCKET');
}

const endpoint = process.env.SES_ENDPOINT;

export const awsConfig = {
  // Basic AWS config
  region: process.env.AWS_REGION || 'us-west-2',

  // Simple Email Service (SES) configuration
  sesEndpoint: endpoint.startsWith('http') ? endpoint : `https://${endpoint}`,
  sesAccessKey: process.env.SES_ACCESS_ID,
  sesAccessSecret: process.env.SES_ACCESS_SECRET,
  sesBounceAddress: process.env.SES_BOUNCE_EMAIL_ADDRESS,
  sesBouncedEmailBucket: process.env.SES_BOUNCED_EMAIL_BUCKET,
}
