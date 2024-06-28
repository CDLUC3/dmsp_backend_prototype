import mockLogger from "./mockLogger";

// Mock the Pino logger
jest.mock('pino', () => () => mockLogger);

// Always mock out our config files
jest.mock('../config/generalConfig', () => ({
  generalConfig: {
    jwtSecret: 'testing',
    jwtTtl: 5,
  }
}));

jest.mock('../config/oauthConfig', () => ({
  oauthConfig: {
    authorizationCodeLifetime: 10,
    accessTokenLifetime: 30,
    refreshTokenLifetime: 30,
  }
}))