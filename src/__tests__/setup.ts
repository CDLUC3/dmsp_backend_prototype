import { logger } from '../__mocks__/logger';

// Mock the Pino logger
jest.mock('pino', () => () => logger);

// Always mock out our config files
jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    domain: 'localhost:3000',
    defaultAffiliatioURI: 'https://ror.org/1234abcd',
    jwtSecret: 'testJwtSecret',
    jwtTTL: 30,
    jwtRefreshSecret: 'testJwtRefreshSecret',
    jwtRefreshTTL: 500,
    hashTokenSecret: 'testTokenSecret',
  }
}));

process.env.CACHE_HOST = 'localhost';
process.env.CACHE_PORT = '6379';
