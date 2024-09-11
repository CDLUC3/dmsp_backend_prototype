import { MySQLDataSource } from '../mySQLDataSource';
import * as mysql from 'mysql2/promise';
import { logger, formatLogMessage } from '../../__mocks__/logger';

jest.mock('mysql2/promise');
jest.mock('../../config/mysqlConfig', () => ({
  mysqlConfig: {
    host: 'localhost',
    port: 3306,
    database: 'testdb',
    user: 'testuser',
    password: 'testpassword',
  },
}));

describe('MySQLDataSource', () => {
  let mockPool: mysql.Pool;
  let mockConnection: mysql.PoolConnection;

  beforeEach(() => {
    jest.clearAllMocks();

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

  describe('getInstance', () => {
    it('should create a singleton instance', async () => {
      const instance1 = MySQLDataSource.getInstance();
      const instance2 = MySQLDataSource.getInstance();

      expect(instance1).toBe(instance2);
      expect(mysql.createPool).toHaveBeenCalledTimes(1);
      await MySQLDataSource.removeInstance();
    });

    it('should log an error and throw if pool creation fails', () => {
      (mysql.createPool as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create pool');
      });

      expect(() => MySQLDataSource.getInstance()).toThrow('Failed to create pool');
      expect(formatLogMessage(logger).error).toHaveBeenCalledWith('Unable to establish the MySQL connection pool.');
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
      const instance = MySQLDataSource.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = [' 1 ']; // Simulate a value that needs trimming

      const result = await instance.query(sql, values);

      expect(mockPool.execute).toHaveBeenCalledWith(sql, ['1']); // Trimmed value
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      await MySQLDataSource.removeInstance();
    });

    it('should log an error and throw if query execution fails', async () => {
      const instance = MySQLDataSource.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = ['1'];

      (mockPool.execute as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));

      await expect(instance.query(sql, values)).rejects.toThrow('Database query failed');
      expect(formatLogMessage(logger, {
        err: expect.any(Error),
        sql,
        values,
        message: 'Unable to process SQL query!',
      }).error).toHaveBeenCalled();
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

  describe('SIGTERM handler', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should gracefully close the connection pool on SIGTERM', async () => {
      const instance = MySQLDataSource.getInstance();
      const closeSpy = jest.spyOn(instance, 'close').mockResolvedValueOnce();
      const releaseSpy = jest.spyOn(instance, 'releaseConnection').mockResolvedValueOnce();

      // Correctly mock process.exit to prevent actual exit
      jest.spyOn(process, 'exit').mockImplementation(() => {
        // Prevent actual exit, just a mock for testing
        return undefined as never;
      });

      // Simulate SIGTERM
      process.emit('SIGTERM');

      expect(closeSpy).toHaveBeenCalled();
      expect(releaseSpy).toHaveBeenCalled();
    });

    it('should handle errors when closing the pool on SIGTERM', async () => {
      const instance = MySQLDataSource.getInstance();
      const closeSpy = jest.spyOn(instance, 'close').mockRejectedValueOnce(new Error('Close failed'));
      const releaseSpy = jest.spyOn(instance, 'releaseConnection').mockResolvedValueOnce();

      // Correctly mock process.exit to prevent actual exit
      jest.spyOn(process, 'exit').mockImplementation((() => {
        // Prevent actual exit, just a mock for testing
        return undefined as never;
      }) as never);

      // Simulate SIGTERM
      process.emit('SIGTERM');

      expect(closeSpy).toHaveBeenCalled();
      expect(releaseSpy).toHaveBeenCalled();
    });
  });
});
