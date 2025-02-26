import { MySQLDataSource } from '../mySQLDataSource';
import * as mysql from 'mysql2/promise';
import { logger, formatLogMessage } from '../../__mocks__/logger';
import { buildContext, MockCache, mockToken } from '../../__mocks__/context';
import { MyContext } from '../../context';
import { mysqlGeneralConfig } from '../../config/mysqlConfig';

jest.mock('mysql2/promise');
jest.mock('../../context');

jest.mock('../../config/mysqlConfig', () => ({
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

describe('MySQLDataSource', () => {
  let context: MyContext
  let mockPool: mysql.Pool;
  let mockConnection: mysql.PoolConnection;

  beforeEach(() => {
    jest.resetAllMocks();

    mysqlGeneralConfig.queryCacheEnabled = false;

    context = buildContext(logger, mockToken(), MockCache.getInstance());

    // Mock cache methods
    context.cache.adapter.get = jest.fn().mockResolvedValue(null);
    context.cache.adapter.set = jest.fn().mockResolvedValue(undefined);
    context.cache.adapter.delete = jest.fn().mockResolvedValue(undefined);

    // Mock MySQL pool and connection
    mockConnection = {
      release: jest.fn(),
      execute: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test' }], []]),
    } as unknown as mysql.PoolConnection;

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      execute: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test' }], []]),
      end: jest.fn(),
    } as unknown as mysql.Pool;

    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should create a singleton instance', async () => {
      const instance1 = MySQLDataSource.getInstance();
      const instance2 = MySQLDataSource.getInstance();

      expect(instance1).toBe(instance2);
      expect(mysql.createPool).toHaveBeenCalledTimes(1);
      await MySQLDataSource.removeInstance();
    });

    it('should log an error and throw if pool creation fails', async () => {
      const context = buildContext(logger, mockToken(), MockCache.getInstance());
      (mysql.createPool as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create pool');
      });

      expect(() => MySQLDataSource.getInstance()).toThrow('Failed to create pool');
      expect(formatLogMessage(context).error).toHaveBeenCalledWith(
        'Unable to establish the MySQL connection pool.'
      );
    });
  });

  describe('getConnection', () => {
    it('should retrieve a connection from the pool', async () => {
      const instance = MySQLDataSource.getInstance();
      const connection = await instance.getConnection();

      expect(connection).toBe(mockConnection);
      expect(mockPool.getConnection).toHaveBeenCalled();
      await MySQLDataSource.removeInstance();
    });
  });

  describe('releaseConnection', () => {
    it('should release the connection', async () => {
      const instance = MySQLDataSource.getInstance();
      await instance.getConnection();
      await instance.releaseConnection();

      expect(mockConnection.release).toHaveBeenCalled();
      expect(instance['connection']).toBeNull();
      await MySQLDataSource.removeInstance();
    });
  });

  describe('query', () => {
    it('should execute a SQL query and return rows', async () => {
      mysqlGeneralConfig.queryCacheEnabled = false;
      const instance = MySQLDataSource.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = [' 1 ']; // Simulate a value that needs trimming

      const result = await instance.query(context, sql, values);

      expect(mockPool.execute).toHaveBeenCalledWith(sql, ['1']); // Trimmed value
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      await MySQLDataSource.removeInstance();
    });

    it('should log an error and throw if query execution fails', async () => {
      mysqlGeneralConfig.queryCacheEnabled = false;
      const instance = MySQLDataSource.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = ['1'];

      (mockPool.execute as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));

      await expect(instance.query(context, sql, values)).rejects.toThrow('Database query failed');
      expect(formatLogMessage(context).error).toHaveBeenCalled();
      await MySQLDataSource.removeInstance();
    });
  });

  describe('close', () => {
    it('should close the MySQL connection pool', async () => {
      const instance = MySQLDataSource.getInstance();

      await instance.close();

      expect(mockPool.end).toHaveBeenCalled();
      await MySQLDataSource.removeInstance();
    });
  });

  describe('removeInstance', () => {
    it('should remove and close the singleton instance', async () => {
      const instance = MySQLDataSource.getInstance();
      const closeSpy = jest.spyOn(instance, 'close');

      await MySQLDataSource.removeInstance();

      expect(closeSpy).toHaveBeenCalled();
      expect(MySQLDataSource.getInstance()).not.toBe(instance);
      await MySQLDataSource.removeInstance();
    });
  });
});
