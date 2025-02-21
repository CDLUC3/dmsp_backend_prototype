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
    port: '6379',
    connectTimeout: 10000,
    autoFailoverEnabled: 'false',
    cacheNamespace: 'test-srvr',
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
    queryCacheEnabled: false,
  }
}));

jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    env: 'test',
    domain: 'localhost:3000',
    applicationName: 'My test app',
    defaultAffiliatioURI: 'https://ror.org/1234abcd',

    dmpIdBaseURL: 'http://dmsp.com/',
    dmpIdShoulder: '11.22222/C3',

    orcidBaseURL: 'http://orcid.example.com/',
    rorBaseURL: 'http://ror.example.com/',

    jwtSecret: 'testJwtSecret',
    jwtTTL: 30,
    jwtRefreshSecret: 'testJwtRefreshSecret',
    jwtRefreshTTL: 500,
    hashTokenSecret: 'testTokenSecret',
  }
}));
