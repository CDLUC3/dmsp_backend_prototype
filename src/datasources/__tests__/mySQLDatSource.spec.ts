import { MySQLDataSource } from '../mySQLDataSource';
import * as mysql from 'mysql2/promise';
import { logger, formatLogMessage } from '../../__mocks__/logger';

jest.mock('mysql2/promise');

let mockPool;
let mockError;

describe('MySQLDataSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock MySQL connection pool
    const mockPool = {
      getConnection: jest.fn(),
      execute: jest.fn(),
      end: jest.fn()
    };
    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);

    const mockError = jest.fn();
    (logger.error as jest.Mock) = mockError;
  });

  test('should create a singleton instance', async () => {
    const instance1 = MySQLDataSource.getInstance();
    const instance2 = MySQLDataSource.getInstance();

    expect(instance1).toBe(instance2);
    await MySQLDataSource.removeInstance();
  });

  test('should initialize the pool on creation', async () => {
    const instance = MySQLDataSource.getInstance();
    expect(mysql.createPool).toHaveBeenCalled();
    expect(mockPool.getConnection).toBeDefined();
    expect(mockPool.execute).toBeDefined();
    await MySQLDataSource.removeInstance();
  });

  test('should handle errors during pool initialization', async () => {
    (mysql.createPool as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    expect(() => MySQLDataSource.getInstance()).toThrow('Test error');
    expect(mockError).toHaveBeenCalledWith('Unable to establish the MySQL connection pool.');
    await MySQLDataSource.removeInstance();
  });

  test('should get a connection from the pool', async () => {
    const dataSource = MySQLDataSource.getInstance();
    const mockConnection = {} as mysql.PoolConnection;

    mockPool.getConnection.mockResolvedValue(mockConnection);

    const connection = await dataSource.getConnection();
    expect(connection).toBe(mockConnection);
    expect(mockPool.getConnection).toHaveBeenCalled();
    await MySQLDataSource.removeInstance();
  });

  test('should execute a query and return rows', async () => {
    const dataSource = MySQLDataSource.getInstance();
    const mockRows = [{ id: 1, name: 'test' }];

    mockPool.execute.mockResolvedValue([mockRows]);

    const rows = await dataSource.query('SELECT * FROM test');
    expect(rows).toBe(mockRows);
    expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test', []);
    await MySQLDataSource.removeInstance();
  });

  test('should handle errors during query execution', async () => {
    const dataSource = MySQLDataSource.getInstance();

    mockPool.execute.mockRejectedValue(new Error('Query error'));

    await expect(dataSource.query('SELECT * FROM test')).rejects.toThrow('Query error');
    expect(mockError).toHaveBeenCalledWith('Uable to process SQL query!');
    await MySQLDataSource.removeInstance();
  });

  test('should close the pool', async () => {
    const dataSource = MySQLDataSource.getInstance();

    await dataSource.close();
    expect(mockPool.end).toHaveBeenCalled();
    await MySQLDataSource.removeInstance();
  });
});
