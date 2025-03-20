import { mysql } from '../mysql';
import * as mysql2 from 'mysql2/promise';
import { logger, formatLogMessage } from '../../__mocks__/logger';
import { buildContext, MockCache, mockToken } from '../../__mocks__/context';
import { MyContext } from '../../context';

jest.mock('mysql2/promise');
jest.mock('../../context');

describe('mysql', () => {
  let context: MyContext
  let mockPool: mysql2.Pool;
  let mockConnection: mysql2.PoolConnection;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken(), MockCache.getInstance());

    // Mock MySQL pool and connection
    mockConnection = {
      release: jest.fn(),
      execute: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test' }], []]),
    } as unknown as mysql2.PoolConnection;

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      execute: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test' }], []]),
      end: jest.fn(),
    } as unknown as mysql2.Pool;

    (mysql2.createPool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should create a singleton instance', async () => {
      const instance1 = mysql.getInstance();
      const instance2 = mysql.getInstance();

      expect(instance1).toBe(instance2);
      expect(mysql2.createPool).toHaveBeenCalledTimes(1);
      await mysql.removeInstance();
    });

    it('should log an error and throw if pool creation fails', async () => {
      const context = buildContext(logger, mockToken());
      (mysql2.createPool as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create pool');
      });

      expect(() => mysql.getInstance()).toThrow('Failed to create pool');
      expect(formatLogMessage(context).error).toHaveBeenCalledWith(
        'Unable to establish the MySQL connection pool.'
      );
    });
  });

  describe('getConnection', () => {
    it('should retrieve a connection from the pool', async () => {
      const instance = mysql.getInstance();
      const connection = await instance.getConnection();

      expect(connection).toBe(mockConnection);
      expect(mockPool.getConnection).toHaveBeenCalled();
      await mysql.removeInstance();
    });
  });

  describe('releaseConnection', () => {
    it('should release the connection', async () => {
      const instance = mysql.getInstance();
      await instance.getConnection();
      await instance.releaseConnection();

      expect(mockConnection.release).toHaveBeenCalled();
      expect(instance['connection']).toBeNull();
      await mysql.removeInstance();
    });
  });

  describe('query', () => {
    it('should execute a SQL query and return rows', async () => {
      const instance = mysql.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = [' 1 ']; // Simulate a value that needs trimming

      const result = await instance.query(context, sql, values);

      expect(mockPool.execute).toHaveBeenCalledWith(sql, ['1']); // Trimmed value
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      await mysql.removeInstance();
    });

    it('should log an error and throw if query execution fails', async () => {
      const instance = mysql.getInstance();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = ['1'];

      (mockPool.execute as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));

      await expect(instance.query(context, sql, values)).rejects.toThrow('Database query failed');
      expect(formatLogMessage(context).error).toHaveBeenCalled();
      await mysql.removeInstance();
    });
  });

  describe('close', () => {
    it('should close the MySQL connection pool', async () => {
      const instance = mysql.getInstance();

      await instance.close();

      expect(mockPool.end).toHaveBeenCalled();
      await mysql.removeInstance();
    });
  });

  describe('removeInstance', () => {
    it('should remove and close the singleton instance', async () => {
      const instance = mysql.getInstance();
      const closeSpy = jest.spyOn(instance, 'close');

      await mysql.removeInstance();

      expect(closeSpy).toHaveBeenCalled();
      expect(mysql.getInstance()).not.toBe(instance);
      await mysql.removeInstance();
    });
  });
});
