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
    dynamoTableName: 'test-table',
    dynamoMaxQueryAttempts: 3,
    dynamoEndpoint: 'http://localhost:8000',
  }
}));

jest.mock('../config/cacheConfig', () => ({
  cacheConfig: {
    host: 'localhost',
    port: '6379',
    connectTimeout: 10000,
    autoFailoverEnabled: 'false',
  },
}));

jest.mock('../config/emailConfig', () => ({
  emailConfig: {
    helpDeskAddress: 'help@example.com',
    doNotReplyAddress: 'do-not-reply@example.com'
  }
}));

jest.mock('../config/dmpHubConfig', () => ({
  DMPHubConfig: {
    dmpHubAuthURL: 'http://auth.dmphub.example.com',
    dmpHubURL: 'http://api.dmphub.example.com',
    dmpHubClientId: '1234567890',
    dmpHubClientSecret: '0987654321',
    dmpHubCacheTTL: 3000,
    dmpHubProvenance: 'testing',
  }
}));

jest.mock('../config/mysqlConfig', () => ({
  mysqlPoolConfig: {
    host: 'localhost',
    port: 3306,
    database: 'testdb',
    user: 'root',
    password: 'testpassword',
  },
  mysqlGeneralConfig: {
    queueLimit: 100,
    connectTimeout: 60000,
  }
}));

jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    env: 'test',
    domain: 'localhost:3000',
    applicationName: 'My test app',
    defaultAffiliatioURI: 'https://ror.org/1234abcd',
    defaultSearchLimit: 5,
    maximumSearchLimit: 10,

    dmpIdBaseURL: 'http://dmsp.com/',
    dmpIdShoulder: '11.22222/C3',

    versionPlanAfter: 1,

    orcidBaseURL: 'http://sandbox.orcid.org/',
    rorBaseURL: 'http://ror.example.com/',

    jwtSecret: 'testJwtSecret',
    jwtTTL: 30,
    jwtRefreshSecret: 'testJwtRefreshSecret',
    jwtRefreshTTL: 500,
    hashTokenSecret: 'testTokenSecret',
  }
}));
