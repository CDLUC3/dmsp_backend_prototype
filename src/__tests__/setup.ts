import { logger } from '../__mocks__/logger';

// Mock the Pino logger
jest.mock('pino', () => () => logger);

// Always mock out our config files
jest.mock('../config/awsConfig', () => ({
  awsConfig: {
    region: 'us-west-2',
    sesEndpoint: 'ses@example.com',
    sesPort: 465,
    sesAccessKey: '12345',
    sesAccessSecret: '98765',
    sesBounceAddress: 'bounce@example.com',
    sesBouncedEmailBucket: 'my-test-bucket',
  }
}));

jest.mock('../config/cacheConfig', () => ({
  cacheConfig: {
    host: 'localhost',
    port: '6379'
  },
  cacheTLS: 'redis://localhost:123'
}));

jest.mock('../config/emailConfig', () => ({
  emailConfig: {
    helpDeskAddress: 'help@example.com',
    doNotReplyAddress: 'do-not-reply@example.com'
  }
}));

jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    env: 'test',
    domain: 'localhost:3000',
    applicationName: 'My test app',
    defaultAffiliatioURI: 'https://ror.org/1234abcd',
    jwtSecret: 'testJwtSecret',
    jwtTTL: 30,
    jwtRefreshSecret: 'testJwtRefreshSecret',
    jwtRefreshTTL: 500,
    hashTokenSecret: 'testTokenSecret',
  }
}));
