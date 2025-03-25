import { buildContext } from '../context';
import { DMPHubAPI } from '../datasources/dmphubAPI';
import { mysql } from '../datasources/mysql';
import { MockCache } from '../__mocks__/context';
// For some reason esLint is reporting this isn't used, but it used below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { randomHex } from '../utils/helpers';

// Mock dependencies
jest.mock('../datasources/dmpHubAPI');
jest.mock('../datasources/mysql');
jest.mock('../datasources/dynamo');
jest.mock('../logger');

describe('buildContext', () => {
  let loggerMock;
  let cacheMock;
  let tokenMock;
  let sqlDataSourceMock;
  let mockGetInstance;

  beforeEach(() => {
    loggerMock = {
      error: jest.fn(),
      info: jest.fn(),
    };
    cacheMock = MockCache.getInstance();
    tokenMock = { accessToken: 'test-token' };
    sqlDataSourceMock = {
      pool: null,
      connection: null,
      initializePool: jest.fn(),
      getConnection: jest.fn(),
      releaseConnection: jest.fn(),
      close: jest.fn(),
      query: jest.fn(),
    };

    mockGetInstance = jest.fn().mockImplementation(() => { return sqlDataSourceMock; });
    (mysql.getInstance as jest.Mock) = mockGetInstance;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return a valid context with provided cache and token', async () => {
    const context = buildContext(loggerMock, cacheMock, tokenMock);

    expect(context.cache).toEqual(cacheMock);
    expect(context.requestId).toBeTruthy();
    expect(context.token).toBe(tokenMock);
    expect(context.logger).toEqual(loggerMock);
    expect(context.dataSources.dmphubAPIDataSource).toBeTruthy();
    expect(context.dataSources.sqlDataSource).toEqual(sqlDataSourceMock);
    expect(context.dataSources.dynamoDataSource).toBeTruthy();

    // Ensure data sources are initialized with cache and token
    expect(DMPHubAPI).toHaveBeenCalledWith({ cache: cacheMock, token: tokenMock });
    expect(mysql.getInstance).toHaveBeenCalled();
  });

  it('should return a valid context with default cache when cache is null', async () => {
    const context = buildContext(loggerMock, null, tokenMock); // Passing null for cache

    expect(context.cache).toBeTruthy();
    expect(context.requestId).toBeTruthy();
    expect(context.token).toBe(tokenMock);
    expect(context.logger).toEqual(loggerMock);
    expect(context.dataSources.dmphubAPIDataSource).toBeTruthy();
    expect(context.dataSources.sqlDataSource).toEqual(sqlDataSourceMock);
    expect(context.dataSources.dynamoDataSource).toBeTruthy();
    expect(context.cache).toEqual({ skipCache: true });

    // Ensure cache is defaulted to { skipCache: true }
    expect(DMPHubAPI).toHaveBeenCalledWith({ cache: { skipCache: true }, token: tokenMock });
  });

  it('should return a valid context with null token when token is null', async () => {
    const context = buildContext(loggerMock, cacheMock, null); // Passing null for token

    expect(context.cache).toEqual(cacheMock);
    expect(context.requestId).toBeTruthy();
    expect(context.token).toBe(null);
    expect(context.logger).toEqual(loggerMock);
    expect(context.dataSources.dmphubAPIDataSource).toBeTruthy();
    expect(context.dataSources.sqlDataSource).toEqual(sqlDataSourceMock);
    expect(context.dataSources.dynamoDataSource).toBeTruthy();

    // Ensure data sources are called with cache and null token
    expect(DMPHubAPI).toHaveBeenCalledWith({ cache: cacheMock, token: null });
  });

  it('should log and return null when an error occurs', async () => {
    // Simulate an error when creating the DMPHubAPI instance
    const mockRandomHex = jest.fn().mockImplementationOnce(() => {
      throw new Error('testing error');
    });
    (randomHex as jest.Mock) = mockRandomHex;

    const context = buildContext(loggerMock, cacheMock, tokenMock);

    expect(context).toBeNull();

    // Ensure the error is logged with the expected message
    expect(loggerMock.error).toHaveBeenCalledWith(
      { err: expect.any(Error), logger: loggerMock, cache: cacheMock, token: tokenMock },
      'Unable to buildContext - testing error'
    );
  });

  it('should log to console when logger is null and an error occurs', async () => {
    console.log = jest.fn(); // Mock console.log

    // Simulate an error when creating the DMPHubAPI instance
    (DMPHubAPI as jest.Mock).mockImplementationOnce(() => {
      throw new Error('API initialization error');
    });

    const context = buildContext(null, cacheMock, tokenMock); // Passing null for logger

    expect(context).toBeNull();

    // Ensure the error is logged to console when logger is null
    expect(console.log).toHaveBeenCalledWith('Unable to buildContext - API initialization error');
  });
});
