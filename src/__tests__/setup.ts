import { logger } from '../__mocks__/logger';

// Mock the Pino logger
jest.mock('pino', () => () => logger);

// Always mock out our config files
jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    jwtSecret: 'testJwtSecret',
    jwtTTL: 5,
    jwtRefreshSecret: 'testJwtRefreshSecret',
    jwtRefreshTTl: 500,
  }
}));

jest.mock('../config/oauthConfig', () => ({
  oauthConfig: {
    authorizationCodeLifetime: 10,
    accessTokenLifetime: 30,
    refreshTokenLifetime: 30,
  }
}))

process.env.CACHE_HOST = 'localhost';
process.env.CACHE_PORT = '6379';
