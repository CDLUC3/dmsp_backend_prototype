import * as mysql2 from 'mysql2/promise';
import {mysqlGeneralConfig, mysqlPoolConfig} from "../config/mysqlConfig";
import { logger, prepareObjectForLogs } from '../logger';
import {MyContext} from '../context';

export interface DatabaseConnection {
  getConnection(): Promise<mysql2.PoolConnection>;
  query<T>(context: MyContext, sql: string, values?: string[]): Promise<T>;
  close(): Promise<void>;
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const POOL_CONFIG = {
  waitForConnections: true,
  multipleStatements: false,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: mysqlGeneralConfig.connectTimeout,
  queueLimit: mysqlGeneralConfig.queueLimit
};

export class MySQLConnection implements DatabaseConnection {
  private pool: mysql2.Pool;

  constructor() {
    logger.info('Establishing MySQL connection pool...');
    try {
      this.pool = mysql2.createPool({
        ...mysqlPoolConfig,
        ...POOL_CONFIG
      });
    } catch (err) {
      logger.error('Unable to establish the MySQL connection pool');
      throw new DatabaseError(
        'Failed to create connection pool',
        err instanceof Error ? err : undefined
      );
    }
  }

  public async getConnection(): Promise<mysql2.PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (err) {
      logger.error('Failed to get connection from pool');
      throw new DatabaseError(
        'Failed to get connection from pool',
        err instanceof Error ? err : undefined
      );
    }
  }

  public async releaseConnection(connection: mysql2.PoolConnection): Promise<void> {
    try {
      connection.release();
    } catch (err) {
      logger.error('Failed to release connection');
      throw new DatabaseError(
        'Failed to release connection',
        err instanceof Error ? err : undefined
      );
    }
  }

  public async query<T>(context: MyContext, sql: string, values: string[] = []): Promise<T> {
    let connection: mysql2.PoolConnection | null = null;
    try {
      connection = await this.getConnection();
      const sanitizedValues = values.map(val =>
        typeof val === 'string' ? val.trim() : val
      );

      const [rows] = await connection.execute(sql, sanitizedValues);
      return rows as T;
    } catch (err) {
      context.logger.error(prepareObjectForLogs({ sql, values, err }), 'Uanble to process SQL query');
      throw new DatabaseError(
        'Database query failed',
        err instanceof Error ? err : undefined
      );
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (err) {
        logger.error('Unable to close the MySQL connection pool');
        throw new DatabaseError(
          'Failed to close connection pool',
          err instanceof Error ? err : undefined
        );
      }
    }
  }
}
