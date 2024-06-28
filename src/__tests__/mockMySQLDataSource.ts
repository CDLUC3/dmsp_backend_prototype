import { MySQLDataSource } from '../datasources/mySQLDataSource';

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
