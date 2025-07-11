import { MySQLConnection } from '../mysql';
import * as mysql2 from 'mysql2/promise';
import { buildMockContextWithToken } from '../../__mocks__/context';
import { MyContext } from '../../context';

import { logger } from "../../logger";

jest.mock('mysql2/promise');
jest.mock('../../context');

describe('MySQLConnection', () => {
  let context: MyContext
  let mockPool: mysql2.Pool;
  let mockConnection: mysql2.PoolConnection;

  beforeEach(async () => {
    jest.resetAllMocks();

    //  context = buildContext(logger, mockToken(), MockCache.getInstance());
    context = await buildMockContextWithToken(logger);

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
    it('should log an error and throw if pool creation fails', async () => {
      jest.spyOn(mysql2, 'createPool').mockImplementationOnce(() => {
        throw new Error('Failed to create pool');
      });
      jest.spyOn(logger, 'error');

      expect(() => new MySQLConnection()).toThrow('Failed to create connection pool');
      expect(logger.error).toHaveBeenCalledWith('Unable to establish the MySQL connection pool');
    });
  });

  describe('getConnection', () => {
    it('should retrieve a connection from the pool', async () => {
      const sqlDataSource = new MySQLConnection();
      const connection = await sqlDataSource.getConnection();

      expect(connection).toBe(mockConnection);
      expect(mockPool.getConnection).toHaveBeenCalled();
      await sqlDataSource.close();
    });
  });

  describe('releaseConnection', () => {
    it('should release the connection', async () => {
      const sqlDataSource = new MySQLConnection();
      const connection = await sqlDataSource.getConnection();
      await sqlDataSource.releaseConnection(connection);

      expect(mockConnection.release).toHaveBeenCalled();
      await sqlDataSource.close();
    });
  });

  describe('query', () => {
    it('should execute a SQL query and return rows', async () => {
      const sqlDataSource = new MySQLConnection();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = [' 1 ']; // Simulate a value that needs trimming

      const result = await sqlDataSource.query(context, sql, values);

      expect(mockConnection.execute).toHaveBeenCalledWith(sql, ['1']); // Trimmed value
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      await sqlDataSource.close();
    });

    it('should log an error and throw if query execution fails', async () => {
      const sqlDataSource = new MySQLConnection();
      const sql = 'SELECT * FROM users WHERE id = ?';
      const values = ['1'];

      (mockConnection.execute as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));

      await expect(sqlDataSource.query(context, sql, values)).rejects.toThrow('Database query failed');
      expect(context.logger.error).toHaveBeenCalled();
      await sqlDataSource.close();
    });
  });

  describe('close', () => {
    it('should close the MySQL connection pool', async () => {
      const sqlDataSource = new MySQLConnection();

      await sqlDataSource.close();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});
