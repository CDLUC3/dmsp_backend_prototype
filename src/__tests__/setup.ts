import 'jest-expect-message';
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

// Mock the MySQL connection
jest.mock('../datasources/mySQLDataSource', () => {
  return {
    __esModule: true,
    MySQLDataSource: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn(),
      }),
    },
  };
});
